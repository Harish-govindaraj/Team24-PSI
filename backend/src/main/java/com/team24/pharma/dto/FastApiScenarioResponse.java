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
public class FastApiScenarioResponse {

    private String category;
    @JsonProperty("nSimulations")
    private Integer nSimulations;
    @JsonProperty("supplyShockPct")
    private Double supplyShockPct;
    @JsonProperty("stockoutProbability")
    private Double stockoutProbability;
    @JsonProperty("meanShortfallUnits")
    private Double meanShortfallUnits;
    private String note;
}
