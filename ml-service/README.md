# PSI ML Service

Machine learning service for TEAM24's Pharma Sales Intelligence (PSI)
hackathon project: real demand forecasting, model evaluation, a real
FastAPI inference layer with SHAP explanations, and a decision-
intelligence layer (risk scoring + recommendations + scenario
analysis) built on clearly-labeled synthetic operational data.

## Architecture
React -> Spring Boot -> FastAPI (this service) -> ML Service -> JSON -> Spring Boot -> React

FastAPI owns all Python ML logic. The backend only ever sees JSON -
no Python ML code belongs in Spring Boot, no ML logic belongs in React.

## Setup

```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Data

- **Real:** place `salesdaily.csv` at `data/raw/salesdaily.csv` (not committed to git - see `HANDOFF.md` section 14 for schema).
- **Synthetic:** `data/synthetic/operational_data.json`, regenerated with:
```bash
  python3 scripts/generate_synthetic_data.py
```
  This is demo/hackathon data only - inventory, supplier, and patient-impact fields are NOT real. See `HANDOFF.md` for the full disclaimer.

## Train models

```bash
python3 scripts/train.py
```
Evaluates 6 candidate models per category via walk-forward validation, selects the best by measured WAPE, and saves artifacts to `models/artifacts/` (gitignored - each environment must run this once).

## Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service + registered-model status |
| POST | `/forecast` | Real forecast for one category |
| GET | `/operational-data/{category}` | Synthetic inventory/supplier/patient data |
| GET | `/decision-intelligence/{category}` | Forecast + risk + recommendations |
| POST | `/scenario` | Supply-shock / Monte Carlo scenario analysis |

Full request/response examples: `HANDOFF.md`.

## Testing

```bash
python3 -m pytest tests/ -v            # full suite
python3 scripts/smoke_test.py          # live-server sanity check (uvicorn must be running)
```

## Known limitations

See `HANDOFF.md`, section 16.