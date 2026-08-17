package com.team24.pharma.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class ScenarioRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Horizon is required")
    @Min(value = 1, message = "Horizon must be at least 1")
    @Max(value = 90, message = "Horizon must not exceed 90")
    private Integer horizon;

    @NotNull(message = "Supply shock percentage is required")
    @DecimalMin(value = "0.0", message = "Supply shock percentage cannot be negative")
    @DecimalMax(value = "0.95", message = "Supply shock percentage cannot exceed 0.95")
    private Double supplyShockPct;

    @NotNull(message = "Number of simulations is required")
    @Min(value = 50, message = "Number of simulations must be at least 50")
    @Max(value = 2000, message = "Number of simulations must not exceed 2000")
    private Integer nSimulations;
}
