package com.team24.pharma.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiDecisionIntelligenceResponse {

    @JsonProperty("riskAssessment")
    private FastApiRiskAssessment riskAssessment;

    @JsonProperty("recommendations")
    private List<FastApiRecommendation> recommendations;
}
