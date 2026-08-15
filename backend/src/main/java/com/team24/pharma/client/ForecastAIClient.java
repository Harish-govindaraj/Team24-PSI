package com.team24.pharma.client;

import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;

/**
 * Abstraction for the AI forecast service.
 * Allows swapping implementations (e.g., FastAPI, mock) without changing business logic.
 */
public interface ForecastAIClient {

    ForecastResponse getForecast(ForecastRequest request);
}
