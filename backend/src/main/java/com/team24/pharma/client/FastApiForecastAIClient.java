package com.team24.pharma.client;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.team24.pharma.common.exception.AiServiceException;
import com.team24.pharma.dto.ExplanationItem;
import com.team24.pharma.dto.FastApiConfidence;
import com.team24.pharma.dto.FastApiExplanation;
import com.team24.pharma.dto.FastApiExplanationFeature;
import com.team24.pharma.dto.FastApiForecastResponse;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;
import com.team24.pharma.dto.ModelMetrics;

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
            FastApiForecastResponse fastApiResponse = aiServiceRestClient
                    .post()
                    .uri("/forecast")
                    .body(request)
                    .retrieve()
                    .body(FastApiForecastResponse.class);

            if (fastApiResponse == null) {
                throw new AiServiceException("Received null response from AI forecast service");
            }

            ForecastResponse response = mapToForecastResponse(fastApiResponse);

            log.debug("Received forecast response for category: {}, model: {}",
                    response.getCategory(), response.getModel());

            return response;

        } catch (RestClientException ex) {
            log.error("Error calling AI forecast service: {}", ex.getMessage());
            throw new AiServiceException("Failed to get forecast from AI service", ex);
        }
    }

    private ForecastResponse mapToForecastResponse(FastApiForecastResponse src) {
        return ForecastResponse.builder()
                .category(src.getCategory())
                .model(src.getModelType())
                .trend(src.getTrend())
                .seasonality(src.getSeasonalityDetected() != null && src.getSeasonalityDetected()
                        ? "detected" : null)
                .confidenceScore(mapConfidenceScore(src.getConfidence()))
                .forecast(src.getForecast())
                .metrics(mapMetrics(src.getConfidence()))
                .explanation(mapExplanation(src.getExplanation()))
                .build();
    }

    /**
     * Derives a 0–1 confidence score from the WAPE percentage.
     * Lower WAPE means higher confidence: score = max(0, 1 − wape/100).
     */
    private BigDecimal mapConfidenceScore(FastApiConfidence confidence) {
        if (confidence == null || confidence.getMeanWapePct() == null) {
            return null;
        }
        BigDecimal wapeFraction = confidence.getMeanWapePct()
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal score = BigDecimal.ONE.subtract(wapeFraction);
        return score.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : score;
    }

    /**
     * Maps FastAPI confidence metrics to the existing ModelMetrics DTO.
     * wape → wape (percentage value preserved), smape → smape, mae left null
     * since FastAPI does not provide MAE in /forecast.
     */
    private ModelMetrics mapMetrics(FastApiConfidence confidence) {
        if (confidence == null) {
            return null;
        }
        return ModelMetrics.builder()
                .wape(confidence.getMeanWapePct())
                .smape(confidence.getMeanSmapePct())
                .build();
    }

    /**
     * Converts the FastAPI explanation object to List&lt;ExplanationItem&gt;.
     * Each topFeature becomes an ExplanationItem with feature name and importance.
     */
    private List<ExplanationItem> mapExplanation(FastApiExplanation explanation) {
        if (explanation == null || !Boolean.TRUE.equals(explanation.getAvailable())) {
            return null;
        }
        List<FastApiExplanationFeature> features = explanation.getTopFeatures();
        if (features == null || features.isEmpty()) {
            return Collections.emptyList();
        }
        return features.stream()
                .map(f -> ExplanationItem.builder()
                        .feature(f.getFeature())
                        .importance(f.getMeanAbsShapValue())
                        .build())
                .toList();
    }
}
