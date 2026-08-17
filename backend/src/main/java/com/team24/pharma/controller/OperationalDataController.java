package com.team24.pharma.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team24.pharma.common.response.ApiResponse;
import com.team24.pharma.dto.OperationalDataResponse;
import com.team24.pharma.client.ForecastAIClient;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/operational-data")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PHARMA_SHOP_OWNER', 'PHARMA_COMPANY_OWNER', 'ADMIN')")
public class OperationalDataController {

    private final ForecastAIClient forecastAIClient;

    @GetMapping("/{category}")
    public ResponseEntity<ApiResponse<OperationalDataResponse>> getOperationalData(@PathVariable String category) {
        OperationalDataResponse response = forecastAIClient.getOperationalData(category);

        return ResponseEntity.ok(ApiResponse.success(response, "Operational data retrieved successfully"));
    }
}
