package com.team24.pharma.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityReportResponse {
    private String category;
    private String modelType;
    private String modelVersion;
    private String trainedAt;
    private Integer nTrainingRows;
    private String demandClassification;
    private Double classificationConfidence;
    private ConfidenceInfo confidence;
}
