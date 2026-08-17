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
import com.team24.pharma.dto.OperationalDataResponse;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

@WebMvcTest(OperationalDataController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class OperationalDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ForecastAIClient forecastAIClient;

    @org.springframework.test.context.bean.override.mockito.MockitoBean 
    private com.team24.pharma.security.JwtService jwtService;

    @Test
    void getOperationalData_returnsApiResponse() throws Exception {
        OperationalDataResponse mockResponse = OperationalDataResponse.builder()
                .category("R03")
                .inventoryUnits(730)
                .reorderPointUnits(141)
                .supplierLeadTimeDays(17)
                .expiryDaysRemaining(208)
                .patientImpactScore(7)
                .substituteAvailable(true)
                .region("Central")
                .unitPriceInr(new BigDecimal("385.54"))
                .promotionActive(false)
                .isSynthetic(true)
                .disclaimer("Test disclaimer")
                .build();

        when(forecastAIClient.getOperationalData("R03")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/operational-data/R03")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Operational data retrieved successfully"))
                .andExpect(jsonPath("$.data.category").value("R03"))
                .andExpect(jsonPath("$.data.inventoryUnits").value(730))
                .andExpect(jsonPath("$.data.substituteAvailable").value(true))
                .andExpect(jsonPath("$.data.unitPriceInr").value(385.54))
                .andExpect(jsonPath("$.data.disclaimer").value("Test disclaimer"));
    }
}
