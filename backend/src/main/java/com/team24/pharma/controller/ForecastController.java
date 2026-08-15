package com.team24.pharma.controller;

import org.springframework.http.ResponseEntity;
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
public class ForecastController {

    private final ForecastService forecastService;

    @PostMapping
    public ResponseEntity<ApiResponse<ForecastResponse>> getForecast(
            @Valid @RequestBody ForecastRequest request) {

        ForecastResponse response = forecastService.getForecast(request);

        return ResponseEntity.ok(ApiResponse.success(response, "Forecast generated successfully"));
    }
}
