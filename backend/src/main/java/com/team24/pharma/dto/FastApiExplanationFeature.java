package com.team24.pharma.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal DTO representing a single feature entry in the FastAPI
 * /forecast response's explanation.topFeatures array.
 *
 * Note: FastAPI returns camelCase JSON. Explicit @JsonProperty annotations
 * override the SNAKE_CASE naming strategy used by aiServiceRestClient.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiExplanationFeature {

    private String feature;

    @JsonProperty("meanAbsShapValue")
    private BigDecimal meanAbsShapValue;
}
