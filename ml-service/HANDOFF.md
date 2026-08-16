# PSI ML Service — Backend Handoff Document

## 1. Endpoints

| Method | Path                                          | Auth |
| ------ | --------------------------------------------- | ---- |
| GET    | `/health`                                     | none |
| POST   | `/forecast`                                   | none |
| GET    | `/operational-data/{category}`                | none |
| GET    | `/decision-intelligence/{category}?horizon=7` | none |
| POST   | `/scenario`                                   | none |

## 2. Request JSON

**POST /forecast**

```json
{ "category": "R03", "horizon": 7 }
```

**GET /decision-intelligence/{category}?horizon=7**
`category` in the URL path; `horizon` as an optional query param (default `7`, range 1-365).

**GET /operational-data/{category}**
`category` in the URL path only.

**POST /scenario**

```json
{ "category": "R03", "horizon": 7, "supplyShockPct": 0.3, "nSimulations": 200 }
```

## 3 & 10. Response JSON (example)

**POST /forecast** (200):

```json
{
  "category": "R03",
  "horizon": 3,
  "modelType": "xgboost",
  "modelVersion": "20260815T140501Z",
  "forecast": [
    {
      "day": 1,
      "date": "2026-08-16",
      "predictedSales": 12.34,
      "lowerBound": null,
      "upperBound": null
    },
    {
      "day": 2,
      "date": "2026-08-17",
      "predictedSales": 11.9,
      "lowerBound": null,
      "upperBound": null
    },
    {
      "day": 3,
      "date": "2026-08-18",
      "predictedSales": 13.05,
      "lowerBound": null,
      "upperBound": null
    }
  ],
  "trend": "increasing",
  "seasonalityDetected": true,
  "confidence": {
    "method": "walk_forward_wape",
    "meanWapePct": 27.65,
    "meanSmapePct": 30.18,
    "note": "meanWapePct/meanSmapePct are this model's measured error rate from Step 2's walk-forward validation on historical data - not a guarantee about this specific forecast."
  },
  "explanation": {
    "available": true,
    "method": "shap.TreeExplainer",
    "topFeatures": [
      { "feature": "lag_7", "meanAbsShapValue": 1.82 },
      { "feature": "rolling_mean_7", "meanAbsShapValue": 1.14 }
    ]
  }
}
```

**GET /decision-intelligence/{category}** (200) — abbreviated:

```json
{
  "category": "R03",
  "horizon": 7,
  "forecastSummary": {
    "modelType": "xgboost",
    "trend": "increasing",
    "seasonalityDetected": true,
    "avgDailyDemand": 12.4,
    "confidence": { "...": "..." }
  },
  "riskAssessment": {
    "category": "R03",
    "avg_daily_demand": 12.4,
    "days_of_supply": 18.5,
    "stockout_risk": "medium",
    "expiry_risk": "low",
    "patient_impact_priority": "high",
    "priority_score": 16.0
  },
  "operationalData": {
    "category": "R03",
    "inventory_units": 230,
    "reorder_point_units": 120,
    "supplier_lead_time_days": 12,
    "expiry_days_remaining": 300,
    "patient_impact_score": 8,
    "substitute_available": true,
    "region": "South",
    "unit_price_inr": 88.5,
    "promotion_active": false,
    "is_synthetic": true,
    "disclaimer": "This record is SYNTHETIC/DEMO operational data ... "
  },
  "recommendations": [
    {
      "strategy": "Inventory Monitoring",
      "action": "Add R03 to the next reorder review cycle",
      "reason": "...",
      "humanApprovalRequired": true
    }
  ],
  "dataDisclaimer": "This record is SYNTHETIC/DEMO operational data ..."
}
```

**POST /scenario** (200):

```json
{
  "category": "R03",
  "nSimulations": 200,
  "supplyShockPct": 0.3,
  "stockoutProbability": 0.14,
  "meanShortfallUnits": 3.2,
  "note": "Simulated demand uncertainty using the model's own measured sMAPE as a rough volatility proxy, against SYNTHETIC inventory data. A simplified scenario estimate for planning discussion, not a validated probabilistic forecast or a guarantee of any kind."
}
```

## 4. Error JSON

All errors share one envelope:

```json
{
  "error": {
    "code": "CATEGORY_NOT_FOUND",
    "message": "'XYZ' is not a known category. Valid categories: [...]"
  }
}
```

| HTTP status | code                 | Meaning                                                                                    |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------ |
| 404         | `CATEGORY_NOT_FOUND` | Category isn't one of the known drug categories                                            |
| 503         | `MODEL_NOT_TRAINED`  | Category is valid but `scripts/train.py` hasn't been run yet on this environment           |
| 422         | `VALIDATION_ERROR`   | Bad request body/params (horizon out of range, empty category, bad scenario params)        |
| 500         | `INTERNAL_ERROR`     | Unexpected server error - full traceback is server-side logged, never leaked to the client |

## 5. Model name(s)

One of six per category, selected automatically by measured walk-forward WAPE: `naive`, `seasonal_naive`, `exponential_smoothing`, `sarima`, `xgboost`, `lightgbm`. **This build's actual per-category selections:**

M01AB → sarima  
M01AE → lightgbm  
N02BA → sarima  
N02BE → exponential_smoothing  
N05B → sarima  
N05C → naive  
R03 → lightgbm  
R06 → lightgbm

## 6. Model version

A UTC timestamp string, format `YYYYMMDDTHHMMSSZ`, in `models/artifacts/manifest.json` and echoed as `modelVersion` in every `/forecast` response. Changes every time `scripts/train.py` is re-run - the backend should treat it as an opaque string, not parse it.

The current training run produced artifacts with version timestamp `20260816T063955Z`.

## 7. Metrics

`meanWapePct`, `meanSmapePct` (and `mean_mae` in the manifest, not currently echoed in the API response) - all from Step 2's walk-forward (expanding-window, chronological) validation on real historical data. These describe the model's **past** measured error rate, not a guarantee for any specific future forecast - the `confidence.note` field says this explicitly in every response.

## 8. Required inputs

| Endpoint                              | Field          | Type        | Constraint                          |
| ------------------------------------- | -------------- | ----------- | ----------------------------------- |
| POST /forecast                        | category       | string      | non-empty, must be a known category |
|                                       | horizon        | int         | 1-365                               |
| GET /decision-intelligence/{category} | horizon        | int (query) | 1-365, default 7                    |
| POST /scenario                        | category       | string      | non-empty, must be a known category |
|                                       | horizon        | int         | 1-90                                |
|                                       | supplyShockPct | float       | 0.0-0.95, default 0.0               |
|                                       | nSimulations   | int         | 50-2000, default 200                |

## 9. Example request

```bash
curl -X POST http://localhost:8000/forecast \
  -H "Content-Type: application/json" \
  -d '{"category": "R03", "horizon": 7}'
```

## 11. Run commands

```bash
git clone <repo-url> && cd Team24-PSI/ml-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# place data/raw/salesdaily.csv manually first (see section 14)
python3 scripts/train.py
python3 scripts/generate_synthetic_data.py   # optional - decision-intelligence falls back to on-the-fly generation otherwise
python3 -m pytest tests/ -v                  # expect 51 passed
uvicorn app.main:app --reload --port 8000
```

## 12. requirements.txt

See `requirements.txt` in the repo root of `ml-service/` - verified against a clean-venv install as of this handoff (Step 5, Part 4).

## 13. Artifact instructions

`models/artifacts/*.joblib` and `manifest.json` are **gitignored** - every environment (including CI, if set up later) must run `python3 scripts/train.py` once before `/forecast` returns real results. Until then, `/forecast` correctly returns `503 MODEL_NOT_TRAINED` rather than crashing or faking a result.

## 14. Dataset version

`data/raw/salesdaily.csv` - 2106 rows, date range 2014-01-02 to 2019-10-08. Not committed to git - must be placed manually before running `scripts/train.py`. Expected columns: `datum` (date) plus one column per drug category (`M01AB`, `M01AE`, `N02BA`, `N02BE`, `N05B`, `N05C`, `R03`, `R06`, or whatever your actual file's columns are - see Step 1's `CATEGORY_COLUMNS` in `app/utils/data_loader.py`).

## 15. Feature list

Used by `xgboost`/`lightgbm` only (statistical models use the raw series directly, no engineered features):

- Lags: `lag_1`, `lag_7`, `lag_14`, `lag_28`
- Rolling (computed on data strictly before the target day): `rolling_mean_7/14/28`, `rolling_std_7/14/28`
- Calendar: `day_of_week`, `is_weekend`, `day_of_month`, `month`, `day_of_year`

## 16. Known limitations

- **Synthetic operational data** (inventory, supplier lead time, expiry, patient-impact score, region, price, promotion) is demo data for hackathon purposes only - it is NOT derived from real inventory, supplier, or patient records. Every response that includes it carries an explicit disclaimer.
- **Prediction intervals** (`lowerBound`/`upperBound`) are only populated for SARIMA-backed categories (a real statistical confidence interval); every other model type returns `null` rather than an invented spread.
- **SHAP explanations** are only implemented for `xgboost`/`lightgbm`-backed categories; statistical-model categories return `explanation.available: false` with a stated reason.
- **Scenario analysis / Monte Carlo** is a simplified normal-distribution demand model using the model's own measured sMAPE as a volatility proxy - a planning aid, not a validated probabilistic forecasting method.
- **No autonomous purchasing** - every recommendation from `/decision-intelligence` carries `humanApprovalRequired: true`; nothing in this service places an order or modifies real inventory.
- **No clinical validation** - `patient_impact_score` and everything derived from it (`patient_impact_priority`) is a synthetic heuristic proxy, not a clinical assessment.
- **No production-grade model monitoring or drift detection** - retraining is manual (`scripts/train.py`), there's no scheduled retraining, alerting, or automatic rollback if a new model performs worse.
- **Model registry keeps only the latest version per category** in `manifest.json`; older `.joblib` files remain on disk after retraining but aren't automatically cleaned up.
- **This is hackathon-scope software** - no auth on any endpoint, no rate limiting, no production deployment hardening.
