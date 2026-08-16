package com.team24.pharma.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ForecastPoint {

    private LocalDate date;

    @JsonProperty("predictedSales")
    private BigDecimal predictedSales;

    @JsonProperty("lowerBound")
    private BigDecimal lowerBound;

    @JsonProperty("upperBound")
    private BigDecimal upperBound;
}
