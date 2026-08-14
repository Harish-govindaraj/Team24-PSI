package com.team24.pharma.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.team24.pharma.common.exception.AiServiceException;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class FastApiForecastAIClient implements ForecastAIClient {

    private final RestClient aiServiceRestClient;

    @Override
    public ForecastResponse getForecast(ForecastRequest request) {
        log.debug("Calling FastAPI forecast service for category: {}, horizon: {}",
                request.getCategory(), request.getHorizon());

        try {
            ForecastResponse response = aiServiceRestClient
                    .post()
                    .uri("/forecast")
                    .body(request)
                    .retrieve()
                    .body(ForecastResponse.class);

            if (response == null) {
                throw new AiServiceException("Received null response from AI forecast service");
            }

            log.debug("Received forecast response for category: {}, model: {}",
                    response.getCategory(), response.getModel());

            return response;

        } catch (RestClientException ex) {
            log.error("Error calling AI forecast service: {}", ex.getMessage());
            throw new AiServiceException("Failed to get forecast from AI service", ex);
        }
    }
}
