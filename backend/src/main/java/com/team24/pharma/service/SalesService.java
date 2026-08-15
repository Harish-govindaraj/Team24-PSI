package com.team24.pharma.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team24.pharma.common.exception.ResourceNotFoundException;
import com.team24.pharma.domain.entity.HistoricalSale;
import com.team24.pharma.domain.repository.HistoricalSaleRepository;
import com.team24.pharma.dto.SalesResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesService {

    private final HistoricalSaleRepository historicalSaleRepository;

    public List<SalesResponse> getSalesByCategory(String category) {
        log.debug("Fetching sales for category: {}", category);

        List<HistoricalSale> sales = historicalSaleRepository
                .findByCategoryCodeOrderBySalesDateAsc(category);

        if (sales.isEmpty()) {
            throw new ResourceNotFoundException("Sales", "category", category);
        }

        return sales.stream()
                .map(this::toSalesResponse)
                .toList();
    }

    public List<SalesResponse> getSalesByCategoryAndDateRange(
            String category, LocalDate from, LocalDate to) {
        log.debug("Fetching sales for category: {} from {} to {}", category, from, to);

        List<HistoricalSale> sales = historicalSaleRepository
                .findByCategoryCodeAndSalesDateBetweenOrderBySalesDateAsc(category, from, to);

        if (sales.isEmpty()) {
            throw new ResourceNotFoundException("Sales", "category", category);
        }

        return sales.stream()
                .map(this::toSalesResponse)
                .toList();
    }

    private SalesResponse toSalesResponse(HistoricalSale sale) {
        return SalesResponse.builder()
                .category(sale.getCategoryCode())
                .date(sale.getSalesDate())
                .salesQuantity(sale.getSalesQuantity())
                .build();
    }
}
