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
import com.team24.pharma.dto.FastApiDecisionIntelligenceResponse;
import com.team24.pharma.dto.FastApiRecommendation;
import com.team24.pharma.dto.FastApiRiskAssessment;
import com.team24.pharma.dto.FastApiOperationalData;
import com.team24.pharma.dto.FastApiScenarioRequest;
import com.team24.pharma.dto.FastApiScenarioResponse;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;
import com.team24.pharma.dto.ModelMetrics;
import com.team24.pharma.dto.OperationalDataResponse;
import com.team24.pharma.dto.RiskResponse;
import com.team24.pharma.dto.RecommendationResponse;
import com.team24.pharma.dto.ScenarioRequest;
import com.team24.pharma.dto.ScenarioResponse;

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

            // Gracefully fetch Decision Intelligence
            try {
                log.debug("Calling FastAPI decision intelligence service for category: {}", request.getCategory());
                FastApiDecisionIntelligenceResponse diResponse = aiServiceRestClient
                        .get()
                        .uri("/decision-intelligence/{category}?horizon={horizon}", request.getCategory(), request.getHorizon())
                        .retrieve()
                        .body(FastApiDecisionIntelligenceResponse.class);

                if (diResponse != null) {
                    response.setRisk(mapRisk(diResponse.getRiskAssessment()));
                    response.setRecommendations(mapRecommendations(diResponse.getRecommendations()));
                }
            } catch (RestClientException ex) {
                log.warn("Failed to get decision intelligence for category: {}, falling back to null risk/recommendations. Error: {}", request.getCategory(), ex.getMessage());
            }

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
                .horizon(src.getHorizon())
                .model(src.getModelType())
                .modelVersion(src.getModelVersion())
                .trend(src.getTrend())
                .seasonality(src.getSeasonalityDetected() != null && src.getSeasonalityDetected()
                        ? "detected" : null)
                .confidenceScore(mapConfidenceScore(src.getConfidence()))
                .forecast(src.getForecast())
                .metrics(mapMetrics(src.getConfidence()))
                .explanation(mapExplanation(src.getExplanation()))
                .build();
    }

    private RiskResponse mapRisk(FastApiRiskAssessment src) {
        if (src == null) return null;

        BigDecimal score = src.getPriorityScore();

        // Use patient_impact_priority as the master severity level
        String rawLevel = src.getPatientImpactPriority();
        String level = (rawLevel != null && !rawLevel.isBlank()) ? rawLevel.toUpperCase() : "LOW";

        String type = "Operational";
        String reason = "No significant risk identified.";

        String stockout = src.getStockoutRisk() != null ? src.getStockoutRisk().toUpperCase() : "LOW";
        String expiry = src.getExpiryRisk() != null ? src.getExpiryRisk().toUpperCase() : "LOW";

        if ("HIGH".equals(stockout)) {
            type = "Stockout";
            reason = "High risk of stockout identified based on operational data and forecasted demand.";
        } else if ("HIGH".equals(expiry)) {
            type = "Expiry";
            reason = "High risk of inventory expiration identified based on shelf life and forecasted demand.";
        } else if ("MEDIUM".equals(stockout)) {
            type = "Stockout";
            reason = "Moderate risk of stockout.";
        } else if ("MEDIUM".equals(expiry)) {
            type = "Expiry";
            reason = "Moderate risk of expiration.";
        }

        return RiskResponse.builder()
            .level(level)
            .score(score)
            .type(type)
            .reason(reason)
            .avgDailyDemand(src.getAvgDailyDemand())
            .daysOfSupply(src.getDaysOfSupply())
            .build();
    }

    private List<RecommendationResponse> mapRecommendations(List<FastApiRecommendation> recommendations) {
        if (recommendations == null || recommendations.isEmpty()) {
            return Collections.emptyList();
        }
        return recommendations.stream()
            .map(rec -> RecommendationResponse.builder()
                .strategy(rec.getStrategy())
                .action(rec.getAction())
                .reason(rec.getReason())
                .humanApprovalRequired(rec.getHumanApprovalRequired())
                .build())
            .toList();
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

    @Override
    public OperationalDataResponse getOperationalData(String category) {
        log.debug("Calling FastAPI operational data service for category: {}", category);

        try {
            FastApiOperationalData fastApiResponse = aiServiceRestClient
                    .get()
                    .uri("/operational-data/{category}", category)
                    .retrieve()
                    .body(FastApiOperationalData.class);

            if (fastApiResponse == null) {
                throw new AiServiceException("Received null response from AI operational data service");
            }

            return mapOperationalData(fastApiResponse);

        } catch (RestClientException ex) {
            log.error("Error calling AI operational data service: {}", ex.getMessage());
            throw new AiServiceException("Failed to get operational data from AI service", ex);
        }
    }

    private OperationalDataResponse mapOperationalData(FastApiOperationalData src) {
        if (src == null) {
            return null;
        }

        return OperationalDataResponse.builder()
                .category(src.getCategory())
                .inventoryUnits(src.getInventoryUnits())
                .reorderPointUnits(src.getReorderPointUnits())
                .supplierLeadTimeDays(src.getSupplierLeadTimeDays())
                .expiryDaysRemaining(src.getExpiryDaysRemaining())
                .patientImpactScore(src.getPatientImpactScore())
                .substituteAvailable(src.getSubstituteAvailable())
                .region(src.getRegion())
                .unitPriceInr(src.getUnitPriceInr())
                .promotionActive(src.getPromotionActive())
                .isSynthetic(src.getIsSynthetic())
                .disclaimer(src.getDisclaimer())
                .build();
    }

    @Override
    public ScenarioResponse runScenario(ScenarioRequest request) {
        log.debug("Calling FastAPI scenario service for category: {}, horizon: {}", request.getCategory(), request.getHorizon());

        try {
            FastApiScenarioRequest apiRequest = FastApiScenarioRequest.builder()
                    .category(request.getCategory())
                    .horizon(request.getHorizon())
                    .supplyShockPct(request.getSupplyShockPct())
                    .nSimulations(request.getNSimulations())
                    .build();

            FastApiScenarioResponse apiResponse = aiServiceRestClient
                    .post()
                    .uri("/scenario")
                    .body(apiRequest)
                    .retrieve()
                    .body(FastApiScenarioResponse.class);

            if (apiResponse == null) {
                throw new AiServiceException("Received null response from AI scenario service");
            }

            return mapScenarioResponse(apiResponse);

        } catch (RestClientException ex) {
            log.error("Error calling AI scenario service: {}", ex.getMessage());
            throw new AiServiceException("Failed to run scenario in AI service", ex);
        }
    }

    private ScenarioResponse mapScenarioResponse(FastApiScenarioResponse src) {
        if (src == null) {
            return null;
        }

        return ScenarioResponse.builder()
                .category(src.getCategory())
                .nSimulations(src.getNSimulations())
                .supplyShockPct(src.getSupplyShockPct())
                .stockoutProbability(src.getStockoutProbability())
                .meanShortfallUnits(src.getMeanShortfallUnits())
                .note(src.getNote())
                .build();
    }
}
