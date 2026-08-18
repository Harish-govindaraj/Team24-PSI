"""
PSI ML Service - FastAPI layer.

Owns: GET /health, POST /forecast, and Step 4 decision-intelligence
endpoints. All actual ML logic lives in app/services and app/models.
This file only wires HTTP in and out.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.models.registry import get_manifest
from app.schemas import (
    ErrorDetail,
    ErrorResponse,
    ForecastRequest,
    ForecastResponse,
    HealthResponse,
)
from app.schemas_decision import (
    DecisionIntelligenceResponse,
    OperationalRecordResponse,
    RecommendationResponse,
    RiskAssessmentResponse,
    ScenarioRequest,
    ScenarioResponse,
)
from app.services.decision_service import (
    get_decision_intelligence,
    load_operational_record,
    run_scenario,
)
from app.services.forecast_service import (
    CategoryNotFoundError,
    ModelNotTrainedError,
    generate_forecast,
)
from app.synthetic.generator import operational_record_to_dict
from app.utils.data_loader import CATEGORY_COLUMNS


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="PSI ML Service", version="1.0.0")


# ============================================================
# STEP 3 — Existing endpoints
# ============================================================

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    manifest = get_manifest()
    return HealthResponse(
        status="ok",
        modelsRegistered=len(manifest),
        categories=sorted(manifest.keys()),
    )


@app.post("/forecast", response_model=ForecastResponse)
def forecast(payload: ForecastRequest) -> dict:
    try:
        return generate_forecast(payload.category, payload.horizon)

    except CategoryNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CATEGORY_NOT_FOUND",
                "message": str(exc),
            },
        )

    except ModelNotTrainedError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "MODEL_NOT_TRAINED",
                "message": str(exc),
            },
        )

    except Exception:
        logger.exception(
            "Unexpected error generating forecast for category=%s horizon=%s",
            payload.category,
            payload.horizon,
        )
        raise HTTPException(
            status_code=500,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
            },
        )


@app.get("/quality-report/{category}")
def quality_report(category: str) -> dict:
    from app.services.forecast_service import generate_quality_report
    try:
        return generate_quality_report(category)
    except CategoryNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CATEGORY_NOT_FOUND",
                "message": str(exc),
            },
        )
    except ModelNotTrainedError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "MODEL_NOT_TRAINED",
                "message": str(exc),
            },
        )
    except Exception:
        logger.exception("Unexpected error generating quality report for category=%s", category)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
            },
        )


# ============================================================
# STEP 4 — Decision-intelligence endpoints
# ============================================================

@app.get(
    "/operational-data/{category}",
    response_model=OperationalRecordResponse,
)
def operational_data(category: str) -> dict:
    if category not in CATEGORY_COLUMNS:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CATEGORY_NOT_FOUND",
                "message": (
                    f"'{category}' is not a known category. "
                    f"Valid categories: {CATEGORY_COLUMNS}"
                ),
            },
        )

    record = load_operational_record(category)
    return operational_record_to_dict(record)


@app.get(
    "/decision-intelligence/{category}",
    response_model=DecisionIntelligenceResponse,
)
def decision_intelligence(category: str, horizon: int = 7) -> dict:
    if horizon < 1 or horizon > 365:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "horizon must be between 1 and 365",
            },
        )

    try:
        return get_decision_intelligence(category, horizon)

    except CategoryNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CATEGORY_NOT_FOUND",
                "message": str(exc),
            },
        )

    except ModelNotTrainedError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "MODEL_NOT_TRAINED",
                "message": str(exc),
            },
        )


@app.post("/scenario", response_model=ScenarioResponse)
def scenario(payload: ScenarioRequest) -> dict:
    try:
        return run_scenario(
            payload.category,
            payload.horizon,
            payload.supplyShockPct,
            payload.nSimulations,
        )

    except CategoryNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CATEGORY_NOT_FOUND",
                "message": str(exc),
            },
        )

    except ModelNotTrainedError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "MODEL_NOT_TRAINED",
                "message": str(exc),
            },
        )


# ============================================================
# Error handlers
# ============================================================

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    detail = exc.detail

    if isinstance(detail, dict) and "code" in detail and "message" in detail:
        content = {"error": detail}
    else:
        content = {
            "error": {
                "code": "HTTP_ERROR",
                "message": str(detail),
            }
        }

    return JSONResponse(
        status_code=exc.status_code,
        content=content,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error=ErrorDetail(
                code="VALIDATION_ERROR",
                message=str(exc.errors()),
            )
        ).model_dump(),
    )