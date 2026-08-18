package com.team24.pharma.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team24.pharma.common.response.ApiResponse;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;
import com.team24.pharma.service.ForecastService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/forecasts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER', 'PHARMA_SHOP_OWNER', 'PHARMA_COMPANY_OWNER', 'ADMIN')")
public class ForecastController {

    private final ForecastService forecastService;

    @PostMapping
    public ResponseEntity<ApiResponse<ForecastResponse>> getForecast(
            @Valid @RequestBody ForecastRequest request) {

        ForecastResponse response = forecastService.getForecast(request);

        return ResponseEntity.ok(ApiResponse.success(response, "Forecast generated successfully"));
    }

    @org.springframework.web.bind.annotation.GetMapping("/{category}/quality-report")
    public ResponseEntity<ApiResponse<com.team24.pharma.dto.QualityReportResponse>> getQualityReport(
            @org.springframework.web.bind.annotation.PathVariable String category) {
        
        com.team24.pharma.dto.QualityReportResponse response = forecastService.getQualityReport(category);
        return ResponseEntity.ok(ApiResponse.success(response, "Quality report fetched successfully"));
    }
}
