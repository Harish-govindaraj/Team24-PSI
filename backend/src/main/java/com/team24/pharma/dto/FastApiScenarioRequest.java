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
public class FastApiScenarioRequest {
    private String category;
    private Integer horizon;
    @JsonProperty("supplyShockPct")
    private Double supplyShockPct;
    @JsonProperty("nSimulations")
    private Integer nSimulations;
}
