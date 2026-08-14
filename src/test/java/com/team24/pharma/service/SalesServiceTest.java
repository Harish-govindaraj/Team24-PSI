package com.team24.pharma.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team24.pharma.common.exception.ResourceNotFoundException;
import com.team24.pharma.domain.entity.HistoricalSale;
import com.team24.pharma.domain.repository.HistoricalSaleRepository;
import com.team24.pharma.dto.SalesResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SalesServiceTest {

    @Mock
    private HistoricalSaleRepository historicalSaleRepository;

    @InjectMocks
    private SalesService salesService;

    @Test
    void getSalesByCategory_returnsMappedSalesResponses() {
        // Arrange
        List<HistoricalSale> sales = List.of(
                HistoricalSale.builder()
                        .id(1L)
                        .categoryCode("R03")
                        .salesDate(LocalDate.of(2024, 1, 15))
                        .salesQuantity(new BigDecimal("1500.00"))
                        .build(),
                HistoricalSale.builder()
                        .id(2L)
                        .categoryCode("R03")
                        .salesDate(LocalDate.of(2024, 2, 15))
                        .salesQuantity(new BigDecimal("1800.50"))
                        .build()
        );

        when(historicalSaleRepository.findByCategoryCodeOrderBySalesDateAsc("R03"))
                .thenReturn(sales);

        // Act
        List<SalesResponse> result = salesService.getSalesByCategory("R03");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCategory()).isEqualTo("R03");
        assertThat(result.get(0).getDate()).isEqualTo(LocalDate.of(2024, 1, 15));
        assertThat(result.get(0).getSalesQuantity()).isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(result.get(1).getSalesQuantity()).isEqualByComparingTo(new BigDecimal("1800.50"));
    }

    @Test
    void getSalesByCategory_throwsResourceNotFoundWhenEmpty() {
        // Arrange
        when(historicalSaleRepository.findByCategoryCodeOrderBySalesDateAsc("UNKNOWN"))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        assertThatThrownBy(() -> salesService.getSalesByCategory("UNKNOWN"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("UNKNOWN");
    }

    @Test
    void getSalesByCategoryAndDateRange_returnsMappedResponses() {
        // Arrange
        LocalDate from = LocalDate.of(2024, 1, 1);
        LocalDate to = LocalDate.of(2024, 3, 31);

        List<HistoricalSale> sales = List.of(
                HistoricalSale.builder()
                        .id(1L)
                        .categoryCode("R03")
                        .salesDate(LocalDate.of(2024, 2, 15))
                        .salesQuantity(new BigDecimal("2000.00"))
                        .build()
        );

        when(historicalSaleRepository
                .findByCategoryCodeAndSalesDateBetweenOrderBySalesDateAsc("R03", from, to))
                .thenReturn(sales);

        // Act
        List<SalesResponse> result = salesService.getSalesByCategoryAndDateRange("R03", from, to);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("R03");
        assertThat(result.get(0).getSalesQuantity()).isEqualByComparingTo(new BigDecimal("2000.00"));
    }

    @Test
    void getSalesByCategoryAndDateRange_throwsResourceNotFoundWhenEmpty() {
        // Arrange
        LocalDate from = LocalDate.of(2024, 1, 1);
        LocalDate to = LocalDate.of(2024, 3, 31);

        when(historicalSaleRepository
                .findByCategoryCodeAndSalesDateBetweenOrderBySalesDateAsc("UNKNOWN", from, to))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        assertThatThrownBy(() -> salesService.getSalesByCategoryAndDateRange("UNKNOWN", from, to))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("UNKNOWN");
    }
}
