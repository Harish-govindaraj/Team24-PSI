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
public class RiskResponse {

    private String level;
    private BigDecimal score;
    private String type;
    private String reason;
}
