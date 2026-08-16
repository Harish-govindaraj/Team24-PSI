"""
Standalone smoke test against a LIVE, already-running ml-service.
Does not use pytest or TestClient - this is meant for anyone (backend
team included) to run against a real server with zero project-specific
knowledge beyond "the server is running".

Usage:
    # In one terminal:
    uvicorn app.main:app --port 8000

    # In another:
    python3 scripts/smoke_test.py
    python3 scripts/smoke_test.py --base-url http://localhost:8000 --category R03
"""

from __future__ import annotations

import argparse
import sys

import httpx


def check(name: str, condition: bool, detail: str = "") -> bool:
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {name}" + (f" - {detail}" if detail and not condition else ""))
    return condition


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--category", default=None, help="Category to test; defaults to the first one /health reports")
    args = parser.parse_args()

    results = []
    client = httpx.Client(base_url=args.base_url, timeout=30.0)

    try:
        health = client.get("/health")
    except httpx.ConnectError:
        print(f"Could not connect to {args.base_url} - is uvicorn running?")
        sys.exit(1)

    results.append(check("GET /health returns 200", health.status_code == 200, str(health.status_code)))
    health_body = health.json()
    results.append(check("/health has modelsRegistered > 0", health_body.get("modelsRegistered", 0) > 0,
                          "run scripts/train.py on the server host first"))

    category = args.category or (health_body.get("categories") or [None])[0]
    if category is None:
        print("No registered categories - cannot continue smoke test. Run scripts/train.py first.")
        sys.exit(1)
    print(f"Using category: {category}")

    forecast = client.post("/forecast", json={"category": category, "horizon": 7})
    results.append(check("POST /forecast returns 200", forecast.status_code == 200, forecast.text[:200]))
    if forecast.status_code == 200:
        body = forecast.json()
        results.append(check("/forecast has 7 forecast points", len(body.get("forecast", [])) == 7))
        results.append(check("/forecast predictions are non-negative",
                              all(p["predictedSales"] >= 0 for p in body.get("forecast", []))))

    op_data = client.get(f"/operational-data/{category}")
    results.append(check("GET /operational-data/{category} returns 200", op_data.status_code == 200))
    if op_data.status_code == 200:
        results.append(check("/operational-data marks itself synthetic", op_data.json().get("is_synthetic") is True))

    decision = client.get(f"/decision-intelligence/{category}", params={"horizon": 7})
    results.append(check("GET /decision-intelligence/{category} returns 200", decision.status_code == 200))
    if decision.status_code == 200:
        recs = decision.json().get("recommendations", [])
        results.append(check("/decision-intelligence returns recommendations", len(recs) > 0))
        results.append(check("every recommendation requires human approval",
                              all(r.get("humanApprovalRequired") is True for r in recs)))

    scenario = client.post("/scenario", json={"category": category, "horizon": 7, "supplyShockPct": 0.3, "nSimulations": 100})
    results.append(check("POST /scenario returns 200", scenario.status_code == 200))

    not_found = client.post("/forecast", json={"category": "NOT_A_REAL_CATEGORY", "horizon": 7})
    results.append(check("unknown category returns 404", not_found.status_code == 404))

    bad_horizon = client.post("/forecast", json={"category": category, "horizon": 0})
    results.append(check("horizon=0 returns 422", bad_horizon.status_code == 422))

    print()
    passed = sum(results)
    total = len(results)
    print(f"{passed}/{total} checks passed")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()