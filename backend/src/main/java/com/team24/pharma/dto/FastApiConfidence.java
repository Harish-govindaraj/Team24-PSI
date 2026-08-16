package com.team24.pharma.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal DTO representing the confidence object in the FastAPI
 * /forecast response.
 *
 * Note: FastAPI returns camelCase JSON. Explicit @JsonProperty annotations
 * override the SNAKE_CASE naming strategy used by aiServiceRestClient.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiConfidence {

    private String method;

    @JsonProperty("meanMae")
    private BigDecimal meanMae;

    @JsonProperty("meanWapePct")
    private BigDecimal meanWapePct;

    @JsonProperty("meanSmapePct")
    private BigDecimal meanSmapePct;

    private String note;
}
