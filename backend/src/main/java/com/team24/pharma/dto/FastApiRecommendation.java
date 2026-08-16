package com.team24.pharma.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiRecommendation {

    private String strategy;
    private String action;
    private String reason;
    // JSON is "humanApprovalRequired" (camelCase), but RestClient is SNAKE_CASE.
    @JsonProperty("humanApprovalRequired")
    private Boolean humanApprovalRequired;
}
