package com.team24.pharma.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team24.pharma.common.response.ApiResponse;
import com.team24.pharma.dto.SalesResponse;
import com.team24.pharma.service.SalesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @GetMapping("/{category}")
    public ResponseEntity<ApiResponse<List<SalesResponse>>> getSalesByCategory(
            @PathVariable String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        List<SalesResponse> sales;

        if (from != null && to != null) {
            sales = salesService.getSalesByCategoryAndDateRange(category, from, to);
        } else {
            sales = salesService.getSalesByCategory(category);
        }

        return ResponseEntity.ok(ApiResponse.success(sales, "Sales data retrieved successfully"));
    }
}
