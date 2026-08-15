package com.team24.pharma.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team24.pharma.client.ForecastAIClient;
import com.team24.pharma.common.exception.AiServiceException;
import com.team24.pharma.domain.repository.ForecastResultRepository;
import com.team24.pharma.dto.ForecastPoint;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForecastServiceTest {

    @Mock
    private ForecastAIClient forecastAIClient;

    @Mock
    private ForecastResultRepository forecastResultRepository;

    @InjectMocks
    private ForecastService forecastService;

    @Test
    void getForecast_callsAIClientAndReturnsResponse() {
        // Arrange
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(30)
                .build();

        ForecastResponse expectedResponse = ForecastResponse.builder()
                .category("R03")
                .model("Prophet")
                .trend("increasing")
                .forecast(List.of(
                        ForecastPoint.builder()
                                .date(LocalDate.of(2024, 4, 1))
                                .predictedSales(new BigDecimal("1500.00"))
                                .lowerBound(new BigDecimal("1200.00"))
                                .upperBound(new BigDecimal("1800.00"))
                                .build()
                ))
                .build();

        when(forecastAIClient.getForecast(request)).thenReturn(expectedResponse);

        // Act
        ForecastResponse result = forecastService.getForecast(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCategory()).isEqualTo("R03");
        assertThat(result.getModel()).isEqualTo("Prophet");
        assertThat(result.getForecast()).hasSize(1);
        verify(forecastAIClient).getForecast(request);
    }

    @Test
    void getForecast_persistsForecastPoints() {
        // Arrange
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(7)
                .build();

        ForecastResponse response = ForecastResponse.builder()
                .category("R03")
                .model("ARIMA")
                .forecast(List.of(
                        ForecastPoint.builder()
                                .date(LocalDate.of(2024, 4, 1))
                                .predictedSales(new BigDecimal("500.00"))
                                .build(),
                        ForecastPoint.builder()
                                .date(LocalDate.of(2024, 4, 2))
                                .predictedSales(new BigDecimal("520.00"))
                                .build()
                ))
                .build();

        when(forecastAIClient.getForecast(request)).thenReturn(response);

        // Act
        forecastService.getForecast(request);

        // Assert
        verify(forecastResultRepository).saveAll(any());
    }

    @Test
    void getForecast_doesNotPersistWhenNoForecastPoints() {
        // Arrange
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(7)
                .build();

        ForecastResponse response = ForecastResponse.builder()
                .category("R03")
                .model("ARIMA")
                .forecast(List.of())
                .build();

        when(forecastAIClient.getForecast(request)).thenReturn(response);

        // Act
        forecastService.getForecast(request);

        // Assert
        verify(forecastResultRepository, never()).saveAll(any());
    }

    @Test
    void getForecast_propagatesAiServiceException() {
        // Arrange
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(30)
                .build();

        when(forecastAIClient.getForecast(request))
                .thenThrow(new AiServiceException("Connection refused"));

        // Act & Assert
        assertThatThrownBy(() -> forecastService.getForecast(request))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("Connection refused");
    }
}
