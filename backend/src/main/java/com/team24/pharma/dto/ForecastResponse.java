package com.team24.pharma.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ForecastResponse {

    private String category;
    private String model;
    private String trend;
    private String seasonality;
    private BigDecimal confidenceScore;
    private List<ForecastPoint> forecast;
    private ModelMetrics metrics;
    private List<ExplanationItem> explanation;
    private RiskResponse risk;
    private RecommendationResponse recommendation;
}
