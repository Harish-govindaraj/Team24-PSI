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
public class FastApiQualityReportResponse {

    private String category;
    
    @JsonProperty("modelType")
    private String modelType;
    
    @JsonProperty("modelVersion")
    private String modelVersion;
    
    @JsonProperty("trainedAt")
    private String trainedAt;
    
    @JsonProperty("nTrainingRows")
    private Integer nTrainingRows;
    
    @JsonProperty("demandClassification")
    private String demandClassification;
    
    @JsonProperty("classificationConfidence")
    private Double classificationConfidence;
    
    private FastApiConfidence confidence;
}
