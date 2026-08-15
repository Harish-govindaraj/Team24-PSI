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
public class ModelMetrics {

    private BigDecimal mae;
    private BigDecimal smape;
    private BigDecimal wape;
}
