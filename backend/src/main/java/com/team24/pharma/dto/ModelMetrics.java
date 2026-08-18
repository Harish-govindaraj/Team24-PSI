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
    private BigDecimal wape;
    private BigDecimal smape;
    private BigDecimal rmse;
    private BigDecimal mase;
    private BigDecimal bias;
    private BigDecimal trendAccuracy;
    private BigDecimal picp;
}
