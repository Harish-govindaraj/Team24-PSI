package com.team24.pharma.client;

import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;
import com.team24.pharma.dto.OperationalDataResponse;
import com.team24.pharma.dto.ScenarioRequest;
import com.team24.pharma.dto.ScenarioResponse;

/**
 * Abstraction for the AI forecast service.
 * Allows swapping implementations (e.g., FastAPI, mock) without changing business logic.
 */
public interface ForecastAIClient {

    ForecastResponse getForecast(ForecastRequest request);

    OperationalDataResponse getOperationalData(String category);

    ScenarioResponse runScenario(ScenarioRequest request);

    com.team24.pharma.dto.QualityReportResponse getQualityReport(String category);
}
