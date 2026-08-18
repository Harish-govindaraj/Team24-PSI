package com.team24.pharma.client;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.json.JsonMapper;

import com.team24.pharma.dto.FastApiConfidence;
import com.team24.pharma.dto.FastApiExplanation;
import com.team24.pharma.dto.FastApiForecastResponse;
import com.team24.pharma.dto.ForecastPoint;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Proves that the snake_case JsonMapper used by aiServiceRestClient
 * correctly deserializes FastAPI's Python-style JSON into Java DTOs,
 * and correctly serializes Java DTOs into snake_case for FastAPI.
 *
 * This test mirrors the exact JsonMapper configuration in RestClientConfig.
 */
class SnakeCaseContractTest {

    private final JsonMapper snakeCaseMapper;

    SnakeCaseContractTest() {
        snakeCaseMapper = JsonMapper.builder()
                .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
    }

    @Test
    void deserializeFastApiForecastResponse_fromActualJson() throws Exception {
        // This is the exact JSON structure FastAPI /forecast returns (camelCase)
        String fastApiJson = """
                {
                    "category": "M01AB",
                    "horizon": 7,
                    "modelType": "sarima",
                    "modelVersion": "20260816T085847Z",
                    "forecast": [
                        {
                            "date": "2019-10-09",
                            "predictedSales": 5.1222,
                            "lowerBound": 0,
                            "upperBound": 10.365
                        },
                        {
                            "date": "2019-10-10",
                            "predictedSales": 6.2000,
                            "lowerBound": null,
                            "upperBound": null
                        }
                    ],
                    "trend": "stable",
                    "seasonality": {
                        "type": "none",
                        "detected": false
                    },
                    "confidence": {
                        "method": "walk_forward_wape",
                        "meanWapePct": 41.3178,
                        "meanSmapePct": 44.4354,
                        "note": "Walk-forward validation note"
                    },
                    "explanation": {
                        "available": true,
                        "method": "shap.TreeExplainer",
                        "reason": null,
                        "topFeatures": [
                            {
                                "feature": "day_of_week",
                                "meanAbsShapValue": 0.337
                            }
                        ]
                    }
                }
                """;

        // Act
        FastApiForecastResponse response = snakeCaseMapper.readValue(fastApiJson, FastApiForecastResponse.class);

        // Assert â€” top-level fields
        assertThat(response.getCategory()).isEqualTo("M01AB");
        assertThat(response.getHorizon()).isEqualTo(7);
        assertThat(response.getModelType()).isEqualTo("sarima");
        assertThat(response.getModelVersion()).isEqualTo("20260816T085847Z");
        assertThat(response.getTrend()).isEqualTo("stable");
        assertThat(response.getSeasonality().getDetected()).isFalse();
        assertThat(response.getSeasonality().getType()).isEqualTo("none");

        // Assert â€” forecast points (snake_case â†’ camelCase)
        assertThat(response.getForecast()).hasSize(2);
        ForecastPoint point1 = response.getForecast().get(0);
        assertThat(point1.getDate()).isEqualTo(LocalDate.of(2019, 10, 9));
        assertThat(point1.getPredictedSales())
                .isEqualByComparingTo(new BigDecimal("5.1222"));
        assertThat(point1.getLowerBound())
                .isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(point1.getUpperBound())
                .isEqualByComparingTo(new BigDecimal("10.365"));

        ForecastPoint point2 = response.getForecast().get(1);
        assertThat(point2.getPredictedSales())
                .isEqualByComparingTo(new BigDecimal("6.2000"));
        assertThat(point2.getLowerBound()).isNull();
        assertThat(point2.getUpperBound()).isNull();

        // Assert â€” confidence (object, not scalar)
        FastApiConfidence confidence = response.getConfidence();
        assertThat(confidence).isNotNull();
        assertThat(confidence.getMethod()).isEqualTo("walk_forward_wape");
        assertThat(confidence.getMeanWapePct())
                .isEqualByComparingTo(new BigDecimal("41.3178"));
        assertThat(confidence.getMeanSmapePct())
                .isEqualByComparingTo(new BigDecimal("44.4354"));
        assertThat(confidence.getNote()).isEqualTo("Walk-forward validation note");

        // Assert â€” explanation (object with nested array, not a top-level array)
        FastApiExplanation explanation = response.getExplanation();
        assertThat(explanation).isNotNull();
        assertThat(explanation.getAvailable()).isTrue();
        assertThat(explanation.getMethod()).isEqualTo("shap.TreeExplainer");
        assertThat(explanation.getReason()).isNull();
        assertThat(explanation.getTopFeatures()).hasSize(1);
        assertThat(explanation.getTopFeatures().get(0).getFeature()).isEqualTo("day_of_week");
        assertThat(explanation.getTopFeatures().get(0).getMeanAbsShapValue())
                .isEqualByComparingTo(new BigDecimal("0.337"));
    }

    @Test
    void deserializeFastApiForecastResponse_explanationUnavailable() throws Exception {
        // FastAPI returns explanation.available=false with no topFeatures
        String fastApiJson = """
                {
                    "category": "N02BE",
                    "horizon": 14,
                    "modelType": "sarima",
                    "modelVersion": "20260816T085847Z",
                    "forecast": [],
                    "trend": "increasing",
                    "seasonality": {
                        "type": "weekly",
                        "period": 7,
                        "strength": 0.45,
                        "detected": true
                    },
                    "confidence": {
                        "method": "walk_forward_wape",
                        "meanWapePct": 20.0,
                        "meanSmapePct": 18.5,
                        "note": null
                    },
                    "explanation": {
                        "available": false,
                        "method": null,
                        "reason": "SHAP not supported for SARIMA models",
                        "topFeatures": null
                    }
                }
                """;

        FastApiForecastResponse response = snakeCaseMapper.readValue(fastApiJson, FastApiForecastResponse.class);

        assertThat(response.getExplanation().getAvailable()).isFalse();
        assertThat(response.getExplanation().getReason()).isEqualTo("SHAP not supported for SARIMA models");
        assertThat(response.getExplanation().getTopFeatures()).isNull();
    }

    @Test
    void serializeForecastRequest_toSnakeCaseJson() throws Exception {
        // ForecastRequest fields are single-word (category, horizon)
        // so snake_case == camelCase. This test confirms no surprises.
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(30)
                .build();

        String json = snakeCaseMapper.writeValueAsString(request);

        assertThat(json).contains("\"category\"");
        assertThat(json).contains("\"horizon\"");
        assertThat(json).contains("\"R03\"");
        assertThat(json).contains("30");
    }

    @Test
    void deserializeForecastResponse_withMinimalJson() throws Exception {
        // ForecastResponse can still be deserialized from minimal JSON
        // (e.g., for testing or from other sources)
        String minimalJson = """
                {
                    "category": "A02",
                    "model": "ARIMA",
                    "forecast": [
                        {
                            "date": "2024-05-01",
                            "predictedSales": 800.00
                        }
                    ]
                }
                """;

        ForecastResponse response = snakeCaseMapper.readValue(minimalJson, ForecastResponse.class);

        assertThat(response.getCategory()).isEqualTo("A02");
        assertThat(response.getModel()).isEqualTo("ARIMA");
        assertThat(response.getTrend()).isNull();
        assertThat(response.getConfidenceInfo()).isNull();
        assertThat(response.getMetrics()).isNull();
        assertThat(response.getExplanation()).isNull();
        assertThat(response.getRisk()).isNull();
        assertThat(response.getRecommendations()).isNull();

        assertThat(response.getForecast()).hasSize(1);
        assertThat(response.getForecast().get(0).getPredictedSales())
                .isEqualByComparingTo(new BigDecimal("800.00"));
        assertThat(response.getForecast().get(0).getLowerBound()).isNull();
    }

    @Test
    void deserializeFastApiForecastResponse_ignoresUnknownFields() throws Exception {
        // FastAPI may add new fields in the future â€” Spring Boot must not break
        String jsonWithExtras = """
                {
                    "category": "R03",
                    "modelType": "xgboost",
                    "some_future_field": "unexpected_value",
                    "horizon": 7,
                    "forecast": [],
                    "trend": "stable",
                    "seasonality": {
                        "type": "none",
                        "detected": false
                    },
                    "extra_nested": {"foo": "bar"}
                }
                """;

        FastApiForecastResponse response = snakeCaseMapper.readValue(jsonWithExtras, FastApiForecastResponse.class);

        assertThat(response.getCategory()).isEqualTo("R03");
        assertThat(response.getModelType()).isEqualTo("xgboost");
        assertThat(response.getForecast()).isEmpty();
    }
}
