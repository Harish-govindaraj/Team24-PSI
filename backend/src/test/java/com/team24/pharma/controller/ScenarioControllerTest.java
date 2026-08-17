package com.team24.pharma.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.team24.pharma.client.ForecastAIClient;
import com.team24.pharma.config.SecurityConfig;
import com.team24.pharma.dto.ScenarioResponse;

import java.util.stream.Stream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

@WebMvcTest(ScenarioController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ScenarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ForecastAIClient forecastAIClient;

    @org.springframework.test.context.bean.override.mockito.MockitoBean 
    private com.team24.pharma.security.JwtService jwtService;


    @Test
    void runScenario_validRequest_returns200() throws Exception {
        ScenarioResponse mockResponse = ScenarioResponse.builder()
                .category("R03")
                .nSimulations(200)
                .supplyShockPct(0.3)
                .stockoutProbability(0.15)
                .meanShortfallUnits(10.5)
                .note("Test note")
                .build();

        when(forecastAIClient.runScenario(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "category": "R03",
                            "horizon": 7,
                            "supplyShockPct": 0.3,
                            "nSimulations": 200
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Scenario simulation completed successfully"))
                .andExpect(jsonPath("$.data.category").value("R03"))
                .andExpect(jsonPath("$.data.stockoutProbability").value(0.15))
                .andExpect(jsonPath("$.data.meanShortfallUnits").value(10.5));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("provideInvalidScenarios")
    void runScenario_invalidRequest_returns400WithValidationMessage(
            String testName, String jsonPayload, String expectedField, String expectedMessage) throws Exception {

        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data." + expectedField).value(expectedMessage));
    }

    private static Stream<Arguments> provideInvalidScenarios() {
        return Stream.of(
            Arguments.of(
                "horizon > 90",
                """
                { "category": "R03", "horizon": 100, "supplyShockPct": 0.3, "nSimulations": 200 }
                """,
                "horizon", "Horizon must not exceed 90"
            ),
            Arguments.of(
                "horizon < 1",
                """
                { "category": "R03", "horizon": 0, "supplyShockPct": 0.3, "nSimulations": 200 }
                """,
                "horizon", "Horizon must be at least 1"
            ),
            Arguments.of(
                "supplyShockPct < 0",
                """
                { "category": "R03", "horizon": 7, "supplyShockPct": -0.1, "nSimulations": 200 }
                """,
                "supplyShockPct", "Supply shock percentage cannot be negative"
            ),
            Arguments.of(
                "supplyShockPct > 0.95",
                """
                { "category": "R03", "horizon": 7, "supplyShockPct": 1.0, "nSimulations": 200 }
                """,
                "supplyShockPct", "Supply shock percentage cannot exceed 0.95"
            ),
            Arguments.of(
                "nSimulations < 50",
                """
                { "category": "R03", "horizon": 7, "supplyShockPct": 0.3, "nSimulations": 10 }
                """,
                "nSimulations", "Number of simulations must be at least 50"
            ),
            Arguments.of(
                "nSimulations > 2000",
                """
                { "category": "R03", "horizon": 7, "supplyShockPct": 0.3, "nSimulations": 3000 }
                """,
                "nSimulations", "Number of simulations must not exceed 2000"
            ),
            Arguments.of(
                "missing required category",
                """
                { "horizon": 7, "supplyShockPct": 0.3, "nSimulations": 200 }
                """,
                "category", "Category is required"
            ),
            Arguments.of(
                "missing required horizon",
                """
                { "category": "R03", "supplyShockPct": 0.3, "nSimulations": 200 }
                """,
                "horizon", "Horizon is required"
            )
        );
    }
}
