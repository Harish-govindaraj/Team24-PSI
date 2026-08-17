package com.team24.pharma.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team24.pharma.common.response.ApiResponse;
import com.team24.pharma.dto.ScenarioRequest;
import com.team24.pharma.dto.ScenarioResponse;
import com.team24.pharma.client.ForecastAIClient;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/scenarios")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PHARMA_COMPANY_OWNER', 'ADMIN')")
public class ScenarioController {

    private final ForecastAIClient forecastAIClient;

    @PostMapping
    public ResponseEntity<ApiResponse<ScenarioResponse>> runScenario(@Valid @RequestBody ScenarioRequest request) {
        ScenarioResponse response = forecastAIClient.runScenario(request);

        return ResponseEntity.ok(ApiResponse.success(response, "Scenario simulation completed successfully"));
    }
}
