package com.team24.pharma.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiOperationalData {

    private String category;

    @JsonProperty("inventory_units")
    private Integer inventoryUnits;

    @JsonProperty("reorder_point_units")
    private Integer reorderPointUnits;

    @JsonProperty("supplier_lead_time_days")
    private Integer supplierLeadTimeDays;

    @JsonProperty("expiry_days_remaining")
    private Integer expiryDaysRemaining;

    @JsonProperty("patient_impact_score")
    private Integer patientImpactScore;

    @JsonProperty("substitute_available")
    private Boolean substituteAvailable;

    private String region;

    @JsonProperty("unit_price_inr")
    private BigDecimal unitPriceInr;

    @JsonProperty("promotion_active")
    private Boolean promotionActive;

    @JsonProperty("is_synthetic")
    private Boolean isSynthetic;

    private String disclaimer;
}
