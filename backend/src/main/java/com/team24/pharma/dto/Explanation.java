package com.team24.pharma.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Explanation {
    private Boolean available;
    private String method;
    private String reason;
    private List<ExplanationItem> topFeatures;
}
