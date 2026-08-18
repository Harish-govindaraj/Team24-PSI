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
import com.team24.pharma.dto.FastApiConfidence;
import com.team24.pharma.dto.FastApiExplanation;
import com.team24.pharma.dto.FastApiExplanationFeature;
import com.team24.pharma.dto.FastApiForecastResponse;
import com.team24.pharma.dto.ForecastPoint;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ForecastResponse;
import com.team24.pharma.dto.SeasonalityInfo;

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

    @Mock
    private RestClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private RestClient.RequestHeadersSpec requestHeadersSpec;

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

        FastApiForecastResponse fastApiResponse = FastApiForecastResponse.builder()
                .category("R03")
                .horizon(30)
                .modelType("Prophet")
                .modelVersion("v1.2.3")
                .trend("increasing")
                .seasonality(SeasonalityInfo.builder().detected(true).type("weekly").period(7).strength(0.45).build())
                .confidence(FastApiConfidence.builder()
                        .meanMae(new BigDecimal("12.34"))
                        .meanWapePct(new BigDecimal("5.00"))
                        .meanSmapePct(new BigDecimal("3.12"))
                        .method("multi_factor")
                        .reliabilityScore(new BigDecimal("95.00"))
                        .reliabilityCategory("High")
                        .reliabilityReason("High confidence due to low error")
                        .build())
                .explanation(FastApiExplanation.builder()
                        .available(true)
                        .method("shap.TreeExplainer")
                        .topFeatures(List.of(
                                FastApiExplanationFeature.builder()
                                        .feature("day_of_week")
                                        .meanAbsShapValue(new BigDecimal("0.337"))
                                        .build()))
                        .build())
                .forecast(List.of(
                        ForecastPoint.builder()
                                .date(LocalDate.of(2024, 4, 1))
                                .predictedSales(new BigDecimal("1500.00"))
                                .lowerBound(new BigDecimal("1200.00"))
                                .upperBound(new BigDecimal("1800.00"))
                                .build()
                ))
                .build();

        com.team24.pharma.dto.FastApiDecisionIntelligenceResponse diResponse = com.team24.pharma.dto.FastApiDecisionIntelligenceResponse.builder()
                .riskAssessment(com.team24.pharma.dto.FastApiRiskAssessment.builder()
                        .stockoutRisk("HIGH")
                        .expiryRisk("LOW")
                        .priorityScore(new BigDecimal("8.5"))
                        .patientImpactPriority("CRITICAL")
                        .avgDailyDemand(new BigDecimal("120.5"))
                        .daysOfSupply(new BigDecimal("14.2"))
                        .build())
                .recommendations(List.of(
                        com.team24.pharma.dto.FastApiRecommendation.builder()
                                .strategy("Expedite")
                                .action("Air freight")
                                .reason("Critical")
                                .humanApprovalRequired(true)
                                .build(),
                        com.team24.pharma.dto.FastApiRecommendation.builder()
                                .strategy("Reallocate")
                                .action("Move from West region")
                                .reason("Surplus available")
                                .humanApprovalRequired(false)
                                .build(),
                        com.team24.pharma.dto.FastApiRecommendation.builder()
                                .strategy("Substitute")
                                .action("Offer generic equivalent")
                                .reason("Acceptable alternative")
                                .humanApprovalRequired(false)
                                .build()
                ))
                .build();

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(eq("/forecast"))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(ForecastRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(FastApiForecastResponse.class)).thenReturn(fastApiResponse);

        when(restClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(eq("/decision-intelligence/{category}?horizon={horizon}"), eq("R03"), eq(30)))
                .thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(com.team24.pharma.dto.FastApiDecisionIntelligenceResponse.class)).thenReturn(diResponse);

        // Act
        ForecastResponse result = client.getForecast(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCategory()).isEqualTo("R03");
        assertThat(result.getHorizon()).isEqualTo(30);
        assertThat(result.getModel()).isEqualTo("Prophet");
        assertThat(result.getModelVersion()).isEqualTo("v1.2.3");
        assertThat(result.getTrend()).isEqualTo("increasing");
        assertThat(result.getSeasonality().getDetected()).isTrue();
        assertThat(result.getSeasonality().getType()).isEqualTo("weekly");
        assertThat(result.getConfidenceInfo().getScore()).isEqualByComparingTo(new BigDecimal("95.00"));
        assertThat(result.getForecast()).hasSize(1);

        ForecastPoint point = result.getForecast().get(0);
        assertThat(point.getDate()).isEqualTo(LocalDate.of(2024, 4, 1));
        assertThat(point.getPredictedSales()).isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(point.getLowerBound()).isEqualByComparingTo(new BigDecimal("1200.00"));
        assertThat(point.getUpperBound()).isEqualByComparingTo(new BigDecimal("1800.00"));

        // Assert explanation mapping
        assertThat(result.getExplanation().getTopFeatures()).hasSize(1);
        assertThat(result.getExplanation().getTopFeatures().get(0).getFeature()).isEqualTo("day_of_week");
        assertThat(result.getExplanation().getTopFeatures().get(0).getImportance())
                .isEqualByComparingTo(new BigDecimal("0.337"));

        // Assert metrics mapping
        assertThat(result.getMetrics()).isNotNull();
        assertThat(result.getMetrics().getMae()).isEqualByComparingTo(new BigDecimal("12.34"));
        assertThat(result.getMetrics().getWape()).isEqualByComparingTo(new BigDecimal("5.00"));
        assertThat(result.getMetrics().getSmape()).isEqualByComparingTo(new BigDecimal("3.12"));

        // Assert DI mapping
        assertThat(result.getRisk()).isNotNull();
        assertThat(result.getRisk().getLevel()).isEqualTo("CRITICAL");
        assertThat(result.getRisk().getScore()).isEqualByComparingTo(new BigDecimal("8.5"));
        assertThat(result.getRisk().getType()).isEqualTo("Stockout");
        assertThat(result.getRisk().getAvgDailyDemand()).isEqualByComparingTo(new BigDecimal("120.5"));
        assertThat(result.getRisk().getDaysOfSupply()).isEqualByComparingTo(new BigDecimal("14.2"));

        assertThat(result.getRecommendations()).isNotNull();
        assertThat(result.getRecommendations()).hasSize(3);

        assertThat(result.getRecommendations().get(0).getStrategy()).isEqualTo("Expedite");
        assertThat(result.getRecommendations().get(0).getAction()).isEqualTo("Air freight");
        assertThat(result.getRecommendations().get(0).getReason()).isEqualTo("Critical");
        assertThat(result.getRecommendations().get(0).getHumanApprovalRequired()).isTrue();

        assertThat(result.getRecommendations().get(1).getStrategy()).isEqualTo("Reallocate");
        assertThat(result.getRecommendations().get(1).getAction()).isEqualTo("Move from West region");
        assertThat(result.getRecommendations().get(1).getReason()).isEqualTo("Surplus available");
        assertThat(result.getRecommendations().get(1).getHumanApprovalRequired()).isFalse();

        assertThat(result.getRecommendations().get(2).getStrategy()).isEqualTo("Substitute");
        assertThat(result.getRecommendations().get(2).getAction()).isEqualTo("Offer generic equivalent");
        assertThat(result.getRecommendations().get(2).getReason()).isEqualTo("Acceptable alternative");
        assertThat(result.getRecommendations().get(2).getHumanApprovalRequired()).isFalse();
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
                .hasMessageContaining("AI forecasting service temporarily unavailable");
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
        when(responseSpec.body(FastApiForecastResponse.class)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> client.getForecast(request))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("null response");
    }
}
