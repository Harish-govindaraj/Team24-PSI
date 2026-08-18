package com.team24.pharma.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team24.pharma.client.ForecastAIClient;
import com.team24.pharma.domain.entity.ForecastResult;
import com.team24.pharma.domain.repository.ForecastResultRepository;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForecastService {

    private final ForecastAIClient forecastAIClient;
    private final ForecastResultRepository forecastResultRepository;

    public ForecastResponse getForecast(ForecastRequest request) {
        log.info("Processing forecast request for category: {}, horizon: {}",
                request.getCategory(), request.getHorizon());

        // Call AI service
        ForecastResponse response = forecastAIClient.getForecast(request);

        // Persist forecast points
        persistForecastResults(response);

        return response;
    }

    private void persistForecastResults(ForecastResponse response) {
        if (response.getForecast() == null || response.getForecast().isEmpty()) {
            log.warn("No forecast points to persist for category: {}", response.getCategory());
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        List<ForecastResult> results = response.getForecast().stream()
                .map(point -> ForecastResult.builder()
                        .categoryCode(response.getCategory())
                        .forecastDate(point.getDate())
                        .predictedSales(point.getPredictedSales())
                        .lowerBound(point.getLowerBound())
                        .upperBound(point.getUpperBound())
                        .modelName(response.getModel() != null ? response.getModel() : "unknown")
                        .trend(response.getTrend())
                        .seasonality(response.getSeasonality() != null ? response.getSeasonality().getType() : "none")
                        .confidenceScore(response.getConfidenceInfo() != null ? response.getConfidenceInfo().getScore() : null)
                        .createdAt(now)
                        .build())
                .toList();

        forecastResultRepository.saveAll(results);
        log.info("Persisted {} forecast results for category: {}",
                results.size(), response.getCategory());
    }

    public com.team24.pharma.dto.QualityReportResponse getQualityReport(String category) {
        log.info("Fetching ML quality report for category: {}", category);
        return forecastAIClient.getQualityReport(category);
    }
}
