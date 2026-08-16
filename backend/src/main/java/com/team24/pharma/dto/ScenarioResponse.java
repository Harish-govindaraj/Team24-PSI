package com.team24.pharma.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioResponse {

    private String category;
    private Integer nSimulations;
    private Double supplyShockPct;
    private Double stockoutProbability;
    private Double meanShortfallUnits;
    private String note;
}
