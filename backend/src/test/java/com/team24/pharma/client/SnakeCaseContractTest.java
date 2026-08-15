package com.team24.pharma.client;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.json.JsonMapper;

import com.team24.pharma.dto.ExplanationItem;
import com.team24.pharma.dto.ForecastPoint;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;
import com.team24.pharma.dto.ModelMetrics;
import com.team24.pharma.dto.RecommendationResponse;
import com.team24.pharma.dto.RiskResponse;

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
    void deserializeForecastResponse_fromSnakeCaseJson() throws Exception {
        // This is the exact JSON structure FastAPI will return
        String fastApiJson = """
                {
                    "category": "R03",
                    "model": "Prophet",
                    "trend": "increasing",
                    "seasonality": "yearly",
                    "confidence_score": 0.9500,
                    "forecast": [
                        {
                            "date": "2024-04-01",
                            "predicted_sales": 1500.00,
                            "lower_bound": 1200.00,
                            "upper_bound": 1800.00
                        },
                        {
                            "date": "2024-04-02",
                            "predicted_sales": 1520.50,
                            "lower_bound": null,
                            "upper_bound": null
                        }
                    ],
                    "metrics": {
                        "mae": 45.23,
                        "smape": 3.12,
                        "wape": 2.89
                    },
                    "explanation": [
                        {
                            "feature": "seasonality_yearly",
                            "importance": 0.45,
                            "direction": "positive"
                        }
                    ],
                    "risk": {
                        "level": "LOW",
                        "score": 0.15,
                        "type": "demand_fluctuation",
                        "reason": "Stable historical demand with low variance"
                    },
                    "recommendation": {
                        "strategy": "maintain_stock",
                        "action": "Keep current inventory levels",
                        "reason": "Demand is stable and predictable",
                        "human_approval_required": false
                    }
                }
                """;

        // Act
        ForecastResponse response = snakeCaseMapper.readValue(fastApiJson, ForecastResponse.class);

        // Assert — top-level fields
        assertThat(response.getCategory()).isEqualTo("R03");
        assertThat(response.getModel()).isEqualTo("Prophet");
        assertThat(response.getTrend()).isEqualTo("increasing");
        assertThat(response.getSeasonality()).isEqualTo("yearly");
        assertThat(response.getConfidenceScore())
                .isEqualByComparingTo(new BigDecimal("0.9500"));

        // Assert — forecast points (snake_case → camelCase)
        assertThat(response.getForecast()).hasSize(2);
        ForecastPoint point1 = response.getForecast().get(0);
        assertThat(point1.getDate()).isEqualTo(LocalDate.of(2024, 4, 1));
        assertThat(point1.getPredictedSales())
                .isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(point1.getLowerBound())
                .isEqualByComparingTo(new BigDecimal("1200.00"));
        assertThat(point1.getUpperBound())
                .isEqualByComparingTo(new BigDecimal("1800.00"));

        ForecastPoint point2 = response.getForecast().get(1);
        assertThat(point2.getPredictedSales())
                .isEqualByComparingTo(new BigDecimal("1520.50"));
        assertThat(point2.getLowerBound()).isNull();
        assertThat(point2.getUpperBound()).isNull();

        // Assert — metrics
        ModelMetrics metrics = response.getMetrics();
        assertThat(metrics).isNotNull();
        assertThat(metrics.getMae()).isEqualByComparingTo(new BigDecimal("45.23"));
        assertThat(metrics.getSmape()).isEqualByComparingTo(new BigDecimal("3.12"));
        assertThat(metrics.getWape()).isEqualByComparingTo(new BigDecimal("2.89"));

        // Assert — explanation
        assertThat(response.getExplanation()).hasSize(1);
        ExplanationItem explanation = response.getExplanation().get(0);
        assertThat(explanation.getFeature()).isEqualTo("seasonality_yearly");
        assertThat(explanation.getImportance())
                .isEqualByComparingTo(new BigDecimal("0.45"));
        assertThat(explanation.getDirection()).isEqualTo("positive");

        // Assert — risk
        RiskResponse risk = response.getRisk();
        assertThat(risk).isNotNull();
        assertThat(risk.getLevel()).isEqualTo("LOW");
        assertThat(risk.getScore()).isEqualByComparingTo(new BigDecimal("0.15"));
        assertThat(risk.getType()).isEqualTo("demand_fluctuation");
        assertThat(risk.getReason()).isEqualTo("Stable historical demand with low variance");

        // Assert — recommendation (human_approval_required → humanApprovalRequired)
        RecommendationResponse rec = response.getRecommendation();
        assertThat(rec).isNotNull();
        assertThat(rec.getStrategy()).isEqualTo("maintain_stock");
        assertThat(rec.getAction()).isEqualTo("Keep current inventory levels");
        assertThat(rec.getReason()).isEqualTo("Demand is stable and predictable");
        assertThat(rec.getHumanApprovalRequired()).isFalse();
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
    void deserializeForecastResponse_withMinimalSnakeCaseJson() throws Exception {
        // FastAPI might return a minimal response with only required fields
        String minimalJson = """
                {
                    "category": "A02",
                    "model": "ARIMA",
                    "forecast": [
                        {
                            "date": "2024-05-01",
                            "predicted_sales": 800.00
                        }
                    ]
                }
                """;

        ForecastResponse response = snakeCaseMapper.readValue(minimalJson, ForecastResponse.class);

        assertThat(response.getCategory()).isEqualTo("A02");
        assertThat(response.getModel()).isEqualTo("ARIMA");
        assertThat(response.getTrend()).isNull();
        assertThat(response.getConfidenceScore()).isNull();
        assertThat(response.getMetrics()).isNull();
        assertThat(response.getExplanation()).isNull();
        assertThat(response.getRisk()).isNull();
        assertThat(response.getRecommendation()).isNull();

        assertThat(response.getForecast()).hasSize(1);
        assertThat(response.getForecast().get(0).getPredictedSales())
                .isEqualByComparingTo(new BigDecimal("800.00"));
        assertThat(response.getForecast().get(0).getLowerBound()).isNull();
    }

    @Test
    void deserializeForecastResponse_ignoresUnknownFieldsFromFastApi() throws Exception {
        // FastAPI may add new fields in the future — Spring Boot must not break
        String jsonWithExtras = """
                {
                    "category": "R03",
                    "model": "XGBoost",
                    "some_future_field": "unexpected_value",
                    "confidence_score": 0.8800,
                    "forecast": [],
                    "extra_nested": {"foo": "bar"}
                }
                """;

        ForecastResponse response = snakeCaseMapper.readValue(jsonWithExtras, ForecastResponse.class);

        assertThat(response.getCategory()).isEqualTo("R03");
        assertThat(response.getModel()).isEqualTo("XGBoost");
        assertThat(response.getConfidenceScore())
                .isEqualByComparingTo(new BigDecimal("0.8800"));
        assertThat(response.getForecast()).isEmpty();
    }
}
