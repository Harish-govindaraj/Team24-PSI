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
public class ConfidenceInfo {
    private BigDecimal score;
    private String category;
    private String reason;
    private Boolean picpAvailable;
    private BigDecimal picpTarget;
    private Integer picpSampleCount;
    private BigDecimal meanPicp;
}
