package com.team24.pharma.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiRiskAssessment {

    // JSON is "stockout_risk", SNAKE_CASE strategy maps to stockoutRisk
    private String stockoutRisk;
    // JSON is "expiry_risk", SNAKE_CASE strategy maps to expiryRisk
    private String expiryRisk;
    // JSON is "priority_score", SNAKE_CASE strategy maps to priorityScore
    private BigDecimal priorityScore;
    // JSON is "patient_impact_priority", SNAKE_CASE strategy maps to patientImpactPriority
    private String patientImpactPriority;

    @com.fasterxml.jackson.annotation.JsonProperty("avg_daily_demand")
    private BigDecimal avgDailyDemand;

    @com.fasterxml.jackson.annotation.JsonProperty("days_of_supply")
    private BigDecimal daysOfSupply;
}
