package com.team24.pharma.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.team24.pharma.config.SecurityConfig;
import com.team24.pharma.dto.ForecastResponse;
import com.team24.pharma.service.ForecastService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ForecastController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ForecastControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ForecastService forecastService;

    @Test
    void postForecast_validRequest_returns200() throws Exception {
        // Arrange
        ForecastResponse response = ForecastResponse.builder()
                .category("R03")
                .model("Prophet")
                .build();

        when(forecastService.getForecast(any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/forecasts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "category": "R03",
                                    "horizon": 30
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.category").value("R03"));
    }

    @Test
    void postForecast_blankCategory_returns400() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "category": "",
                                    "horizon": 30
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postForecast_nullHorizon_returns400() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "category": "R03"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postForecast_horizonTooLarge_returns400() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "category": "R03",
                                    "horizon": 500
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postForecast_horizonZero_returns400() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "category": "R03",
                                    "horizon": 0
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
