package com.team24.pharma.dto;

import java.math.BigDecimal;

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
public class OperationalDataResponse {

    private String category;
    private Integer inventoryUnits;
    private Integer reorderPointUnits;
    private Integer supplierLeadTimeDays;
    private Integer expiryDaysRemaining;
    private Integer patientImpactScore;
    private Boolean substituteAvailable;
    private String region;
    private BigDecimal unitPriceInr;
    private Boolean promotionActive;
    private Boolean isSynthetic;
    private String disclaimer;
}
