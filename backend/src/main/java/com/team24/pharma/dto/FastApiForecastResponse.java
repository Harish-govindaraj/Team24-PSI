package com.team24.pharma.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal DTO representing the exact JSON contract returned by the
 * FastAPI /forecast endpoint. Used only in {@code FastApiForecastAIClient}
 * for deserialization, then mapped to the public {@link ForecastResponse}.
 *
 * Note: FastAPI returns camelCase JSON, but the aiServiceRestClient uses
 * a SNAKE_CASE naming strategy. Explicit @JsonProperty annotations override
 * the naming strategy to match the actual FastAPI field names.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiForecastResponse {

    private String category;
    private Integer horizon;

    @JsonProperty("modelType")
    private String modelType;

    @JsonProperty("modelVersion")
    private String modelVersion;

    private List<ForecastPoint> forecast;
    private String trend;

    private SeasonalityInfo seasonality;

    private FastApiConfidence confidence;
    private FastApiExplanation explanation;
}
