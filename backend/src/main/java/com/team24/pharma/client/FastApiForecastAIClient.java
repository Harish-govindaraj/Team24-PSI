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
                        .uri("/decision-intelligence/{category}?horizon={horizon}", request.getCategory(),
                                request.getHorizon())
                        .retrieve()
                        .body(FastApiDecisionIntelligenceResponse.class);

                if (diResponse != null) {
                    response.setRisk(mapRisk(diResponse.getRiskAssessment()));
                    response.setRecommendations(mapRecommendations(diResponse.getRecommendations()));
                }
            } catch (RestClientException ex) {
                log.warn(
                        "Failed to get decision intelligence for category: {}, falling back to null risk/recommendations. Error: {}",
                        request.getCategory(), ex.getMessage());
            }

            log.debug("Received forecast response for category: {}, model: {}",
                    response.getCategory(), response.getModel());

            return response;

        } catch (org.springframework.web.client.RestClientResponseException ex) {
            String errorResponse = ex.getResponseBodyAsString();
            String errorMessage = "Failed to get forecast from AI service";
            try {
                tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.json.JsonMapper();
                tools.jackson.databind.JsonNode root = mapper.readTree(errorResponse);
                if (root.has("error") && root.get("error").has("message")) {
                    errorMessage = root.get("error").get("message").asText();
                } else if (root.has("detail") && root.get("detail").has("message")) {
                    errorMessage = root.get("detail").get("message").asText();
                } else if (root.has("detail") && root.get("detail").isTextual()) {
                    errorMessage = root.get("detail").asText();
                }
            } catch (Exception parseEx) {
                log.warn("Failed to parse AI service error response: {}", errorResponse);
            }
            log.error("AI forecast service error: {} (HTTP {})", errorMessage, ex.getStatusCode());
            throw new AiServiceException(errorMessage, ex, org.springframework.http.HttpStatus.valueOf(ex.getStatusCode().value()), request.getCategory());
        } catch (RestClientException ex) {
            log.error("Error calling AI forecast service: {}", ex.getMessage());
            throw new AiServiceException("AI forecasting service temporarily unavailable", ex, org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, request.getCategory());
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
                        ? "detected"
                        : null)
                .confidenceInfo(mapConfidenceScore(src.getConfidence()))
                .forecast(src.getForecast())
                .metrics(mapMetrics(src.getConfidence()))
                .explanation(mapExplanation(src.getExplanation()))
                .build();
    }

    private RiskResponse mapRisk(FastApiRiskAssessment src) {
        if (src == null)
            return null;

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
            reason = "Projected demand exceeds current inventory levels before the next supplier delivery.";
        } else if ("HIGH".equals(expiry)) {
            type = "Expiry";
            reason = "Projected time to consume current inventory at forecast demand exceeds the remaining shelf life.";
        } else if ("MEDIUM".equals(stockout)) {
            type = "Stockout";
            reason = "Inventory levels are projected to be tight before the next supplier delivery.";
        } else if ("MEDIUM".equals(expiry)) {
            type = "Expiry";
            reason = "A portion of inventory may expire if demand drops below projections.";
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
     * Maps the new multi-factor reliability score.
     */
    private com.team24.pharma.dto.ConfidenceInfo mapConfidenceScore(FastApiConfidence confidence) {
        if (confidence == null) {
            return null;
        }
        return com.team24.pharma.dto.ConfidenceInfo.builder()
                .score(confidence.getReliabilityScore())
                .category(confidence.getReliabilityCategory())
                .reason(confidence.getReliabilityReason())
                .picpAvailable(confidence.getPicpAvailable())
                .picpTarget(confidence.getPicpTarget())
                .picpSampleCount(confidence.getPicpSampleCount())
                .meanPicp(confidence.getMeanPicp())
                .build();
    }

    /**
     * Maps FastAPI confidence metrics to the existing ModelMetrics DTO.
     */
    private ModelMetrics mapMetrics(FastApiConfidence confidence) {
        if (confidence == null) {
            return null;
        }
        return ModelMetrics.builder()
                .mae(confidence.getMeanMae())
                .wape(confidence.getMeanWapePct())
                .smape(confidence.getMeanSmapePct())
                .rmse(confidence.getMeanRmse())
                .mase(confidence.getMeanMase())
                .bias(confidence.getMeanBias())
                .trendAccuracy(confidence.getMeanTrendAcc())
                .picp(confidence.getMeanPicp())
                .build();
    }

    /**
     * Converts the FastAPI explanation object to Explanation DTO.
     */
    private com.team24.pharma.dto.Explanation mapExplanation(FastApiExplanation explanation) {
        if (explanation == null) {
            return null;
        }
        
        List<ExplanationItem> topFeatures = Collections.emptyList();
        if (explanation.getTopFeatures() != null && !explanation.getTopFeatures().isEmpty()) {
            topFeatures = explanation.getTopFeatures().stream()
                    .map(f -> ExplanationItem.builder()
                            .feature(f.getFeature())
                            .importance(f.getMeanAbsShapValue())
                            .build())
                    .toList();
        }

        return com.team24.pharma.dto.Explanation.builder()
                .available(explanation.getAvailable())
                .method(explanation.getMethod())
                .reason(explanation.getReason())
                .topFeatures(topFeatures)
                .build();
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

        } catch (org.springframework.web.client.RestClientResponseException ex) {
            String errorResponse = ex.getResponseBodyAsString();
            String errorMessage = "Failed to get operational data from AI service";
            try {
                tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.json.JsonMapper();
                tools.jackson.databind.JsonNode root = mapper.readTree(errorResponse);
                if (root.has("error") && root.get("error").has("message")) {
                    errorMessage = root.get("error").get("message").asText();
                } else if (root.has("detail") && root.get("detail").has("message")) {
                    errorMessage = root.get("detail").get("message").asText();
                } else if (root.has("detail") && root.get("detail").isTextual()) {
                    errorMessage = root.get("detail").asText();
                }
            } catch (Exception parseEx) {
                log.warn("Failed to parse AI service error response: {}", errorResponse);
            }
            log.error("AI operational data service error: {} (HTTP {})", errorMessage, ex.getStatusCode());
            throw new AiServiceException(errorMessage, ex, org.springframework.http.HttpStatus.valueOf(ex.getStatusCode().value()), category);
        } catch (RestClientException ex) {
            log.error("Error calling AI operational data service: {}", ex.getMessage());
            throw new AiServiceException("AI operational data service temporarily unavailable", ex, org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, category);
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
        log.debug("Calling FastAPI scenario service for category: {}, horizon: {}", request.getCategory(),
                request.getHorizon());

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

        } catch (org.springframework.web.client.RestClientResponseException ex) {
            String errorResponse = ex.getResponseBodyAsString();
            String errorMessage = "Failed to run scenario in AI service";
            try {
                tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.json.JsonMapper();
                tools.jackson.databind.JsonNode root = mapper.readTree(errorResponse);
                if (root.has("error") && root.get("error").has("message")) {
                    errorMessage = root.get("error").get("message").asText();
                } else if (root.has("detail") && root.get("detail").has("message")) {
                    errorMessage = root.get("detail").get("message").asText();
                } else if (root.has("detail") && root.get("detail").isTextual()) {
                    errorMessage = root.get("detail").asText();
                }
            } catch (Exception parseEx) {
                log.warn("Failed to parse AI service error response: {}", errorResponse);
            }
            log.error("AI scenario service error: {} (HTTP {})", errorMessage, ex.getStatusCode());
            throw new AiServiceException(errorMessage, ex, org.springframework.http.HttpStatus.valueOf(ex.getStatusCode().value()), request.getCategory());
        } catch (RestClientException ex) {
            log.error("Error calling AI scenario service: {}", ex.getMessage());
            throw new AiServiceException("AI scenario service temporarily unavailable", ex, org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, request.getCategory());
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

    @Override
    public com.team24.pharma.dto.QualityReportResponse getQualityReport(String category) {
        log.debug("Calling FastAPI quality report service for category: {}", category);

        try {
            com.team24.pharma.dto.FastApiQualityReportResponse apiResponse = aiServiceRestClient
                    .get()
                    .uri("/quality-report/{category}", category)
                    .retrieve()
                    .body(com.team24.pharma.dto.FastApiQualityReportResponse.class);

            if (apiResponse == null) {
                throw new AiServiceException("Received null response from AI quality report service");
            }

            return com.team24.pharma.dto.QualityReportResponse.builder()
                    .category(apiResponse.getCategory())
                    .modelType(apiResponse.getModelType())
                    .modelVersion(apiResponse.getModelVersion())
                    .trainedAt(apiResponse.getTrainedAt())
                    .nTrainingRows(apiResponse.getNTrainingRows())
                    .demandClassification(apiResponse.getDemandClassification())
                    .classificationConfidence(apiResponse.getClassificationConfidence())
                    .confidence(mapConfidenceScore(apiResponse.getConfidence()))
                    .build();

        } catch (org.springframework.web.client.RestClientResponseException ex) {
            String errorResponse = ex.getResponseBodyAsString();
            String errorMessage = "Failed to get quality report from AI service";
            try {
                tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.json.JsonMapper();
                tools.jackson.databind.JsonNode root = mapper.readTree(errorResponse);
                if (root.has("error") && root.get("error").has("message")) {
                    errorMessage = root.get("error").get("message").asText();
                } else if (root.has("detail") && root.get("detail").has("message")) {
                    errorMessage = root.get("detail").get("message").asText();
                } else if (root.has("detail") && root.get("detail").isTextual()) {
                    errorMessage = root.get("detail").asText();
                }
            } catch (Exception parseEx) {
                log.warn("Failed to parse AI service error response: {}", errorResponse);
            }
            log.error("AI quality report service error: {} (HTTP {})", errorMessage, ex.getStatusCode());
            throw new AiServiceException(errorMessage, ex, org.springframework.http.HttpStatus.valueOf(ex.getStatusCode().value()), category);
        } catch (RestClientException ex) {
            log.error("Error calling AI quality report service: {}", ex.getMessage());
            throw new AiServiceException("AI quality report service temporarily unavailable", ex, org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, category);
        }
    }
}
