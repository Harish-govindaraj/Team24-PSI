package com.team24.pharma.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private String strategy;
    private String action;
    private String reason;
    private Boolean humanApprovalRequired;
}
