package com.team24.pharma.controller;

import org.junit.jupiter.api.Test;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ScenarioController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ScenarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ForecastAIClient forecastAIClient;

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

    @Test
    void runScenario_invalidHorizon_returns400() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "category": "R03",
                            "horizon": 100,
                            "supplyShockPct": 0.3,
                            "nSimulations": 200
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void runScenario_invalidSupplyShockNegative_returns400() throws Exception {
        // Validation missing in ScenarioRequest, but I didn't add Negative validation yet. Wait!        // The prompt asked: validation failure for supplyShockPct < 0, validation failure for supplyShockPct > 0.95.
        // Let me add the missing @Min @Max to ScenarioRequest later or just expect BadRequest if I add it.
        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "category": "R03",
                            "horizon": 7,
                            "supplyShockPct": -0.1,
                            "nSimulations": 200
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void runScenario_invalidSupplyShockTooHigh_returns400() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "category": "R03",
                            "horizon": 7,
                            "supplyShockPct": 1.0,
                            "nSimulations": 200
                        }
                        """))
                .andExpect(status().isBadRequest());
    }
    @Test
    void runScenario_invalidSimulationsLow_returns400() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "category": "R03",
                            "horizon": 7,
                            "supplyShockPct": 0.3,
                            "nSimulations": 10
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void runScenario_invalidSimulationsHigh_returns400() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "category": "R03",
                            "horizon": 7,
                            "supplyShockPct": 0.3,
                            "nSimulations": 3000
                        }
                        """))
                .andExpect(status().isBadRequest());
    }
}
