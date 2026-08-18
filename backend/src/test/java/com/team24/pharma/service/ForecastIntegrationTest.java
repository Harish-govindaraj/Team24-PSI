package com.team24.pharma.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.team24.pharma.domain.entity.ForecastResult;
import com.team24.pharma.domain.repository.ForecastResultRepository;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ForecastIntegrationTest {

    @Autowired
    private ForecastResultRepository forecastResultRepository;

    @Test
    @Transactional
    void duplicateForecastRequest_DoesNotViolateConstraint() {
        // Arrange
        ForecastResult result1 = ForecastResult.builder()
                .categoryCode("M01AB")
                .forecastDate(LocalDate.of(2026, 1, 1))
                .predictedSales(new BigDecimal("100.00"))
                .modelName("sarima")
                .confidenceScore(new BigDecimal("70.97"))
                .createdAt(LocalDateTime.now())
                .build();

        ForecastResult result2 = ForecastResult.builder()
                .categoryCode("M01AB")
                .forecastDate(LocalDate.of(2026, 1, 1))
                .predictedSales(new BigDecimal("100.00"))
                .modelName("sarima")
                .confidenceScore(new BigDecimal("70.97"))
                .createdAt(LocalDateTime.now())
                .build();

        // Act & Assert
        // First forecast succeeds
        forecastResultRepository.saveAndFlush(result1);
        
        // Repeating M01AB 7-day forecast does not violate database
        forecastResultRepository.saveAndFlush(result2);

        assertThat(forecastResultRepository.findAll()).hasSize(2);
    }

    @Test
    @Transactional
    void confidenceScore_Supports100PointScale() {
        // Arrange
        ForecastResult result = ForecastResult.builder()
                .categoryCode("M01AB")
                .forecastDate(LocalDate.of(2026, 1, 1))
                .predictedSales(new BigDecimal("100.00"))
                .modelName("sarima")
                .confidenceScore(new BigDecimal("100.00")) // 100-point scale
                .createdAt(LocalDateTime.now())
                .build();

        // Act
        forecastResultRepository.saveAndFlush(result);

        // Assert
        ForecastResult saved = forecastResultRepository.findAll().get(0);
        assertThat(saved.getConfidenceScore()).isEqualByComparingTo(new BigDecimal("100.00"));
    }
}
