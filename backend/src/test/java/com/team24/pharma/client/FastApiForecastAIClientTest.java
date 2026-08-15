package com.team24.pharma.client;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.team24.pharma.common.exception.AiServiceException;
import com.team24.pharma.dto.ForecastPoint;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FastApiForecastAIClientTest {

    @Mock
    private RestClient restClient;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private FastApiForecastAIClient client;

    @BeforeEach
    void setUp() {
        client = new FastApiForecastAIClient(restClient);
    }

    @Test
    void getForecast_mapsResponseCorrectly() {
        // Arrange
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(30)
                .build();

        ForecastResponse expectedResponse = ForecastResponse.builder()
                .category("R03")
                .model("Prophet")
                .trend("increasing")
                .seasonality("yearly")
                .confidenceScore(new BigDecimal("0.9500"))
                .forecast(List.of(
                        ForecastPoint.builder()
                                .date(LocalDate.of(2024, 4, 1))
                                .predictedSales(new BigDecimal("1500.00"))
                                .lowerBound(new BigDecimal("1200.00"))
                                .upperBound(new BigDecimal("1800.00"))
                                .build()
                ))
                .build();

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(eq("/forecast"))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(ForecastRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(ForecastResponse.class)).thenReturn(expectedResponse);

        // Act
        ForecastResponse result = client.getForecast(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCategory()).isEqualTo("R03");
        assertThat(result.getModel()).isEqualTo("Prophet");
        assertThat(result.getTrend()).isEqualTo("increasing");
        assertThat(result.getSeasonality()).isEqualTo("yearly");
        assertThat(result.getConfidenceScore()).isEqualByComparingTo(new BigDecimal("0.9500"));
        assertThat(result.getForecast()).hasSize(1);

        ForecastPoint point = result.getForecast().get(0);
        assertThat(point.getDate()).isEqualTo(LocalDate.of(2024, 4, 1));
        assertThat(point.getPredictedSales()).isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(point.getLowerBound()).isEqualByComparingTo(new BigDecimal("1200.00"));
        assertThat(point.getUpperBound()).isEqualByComparingTo(new BigDecimal("1800.00"));
    }

    @Test
    void getForecast_throwsAiServiceExceptionOnRestClientError() {
        // Arrange
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(30)
                .build();

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(eq("/forecast"))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(ForecastRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenThrow(new RestClientException("Connection refused"));

        // Act & Assert
        assertThatThrownBy(() -> client.getForecast(request))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("Failed to get forecast from AI service");
    }

    @Test
    void getForecast_throwsAiServiceExceptionOnNullResponse() {
        // Arrange
        ForecastRequest request = ForecastRequest.builder()
                .category("R03")
                .horizon(30)
                .build();

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(eq("/forecast"))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(ForecastRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(ForecastResponse.class)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> client.getForecast(request))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("null response");
    }
}
