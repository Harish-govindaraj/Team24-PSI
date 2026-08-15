package com.team24.pharma.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Horizon is required")
    @Min(value = 1, message = "Horizon must be at least 1")
    @Max(value = 365, message = "Horizon must be at most 365")
    private Integer horizon;
}
