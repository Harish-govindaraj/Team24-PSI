package com.team24.pharma.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal DTO representing the explanation object in the FastAPI
 * /forecast response.
 *
 * Note: FastAPI returns camelCase JSON. Explicit @JsonProperty annotations
 * override the SNAKE_CASE naming strategy used by aiServiceRestClient.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiExplanation {

    private Boolean available;
    private String method;
    private String reason;

    @JsonProperty("topFeatures")
    private List<FastApiExplanationFeature> topFeatures;
}
