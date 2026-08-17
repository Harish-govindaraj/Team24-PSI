package com.team24.pharma.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team24.pharma.common.enums.Role;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.dto.ForecastRequest;
import com.team24.pharma.dto.ScenarioRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private ObjectMapper objectMapper = new ObjectMapper();

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.team24.pharma.service.ForecastService forecastService;
    
    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.team24.pharma.client.ForecastAIClient forecastAIClient;

    private String customerToken;
    private String shopOwnerToken;
    private String companyOwnerToken;
    private String adminToken;
    private String pendingShopOwnerToken;
    
    private String forecastJson = "{\"category\":\"M01AE\",\"horizon\":7}";
    private String scenarioJson = "{\"category\":\"M01AE\",\"horizon\":14,\"supplyShockPct\":0.10,\"nSimulations\":100}";

    @BeforeEach
    void setUp() {
        User customer = new User();
        customer.setEmail("customer@example.com");
        customer.setRole(Role.ROLE_CUSTOMER);
        customer.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        customerToken = jwtService.generateToken(customer);

        User shopOwner = new User();
        shopOwner.setEmail("shop@example.com");
        shopOwner.setRole(Role.ROLE_PHARMA_SHOP_OWNER);
        shopOwner.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        shopOwnerToken = jwtService.generateToken(shopOwner);

        User companyOwner = new User();
        companyOwner.setEmail("company@example.com");
        companyOwner.setRole(Role.ROLE_PHARMA_COMPANY_OWNER);
        companyOwner.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        companyOwnerToken = jwtService.generateToken(companyOwner);

        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ROLE_ADMIN);
        admin.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        adminToken = jwtService.generateToken(admin);

        User pendingShopOwner = new User();
        pendingShopOwner.setEmail("pending@example.com");
        pendingShopOwner.setRole(Role.ROLE_CUSTOMER);
        pendingShopOwner.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.PENDING_VERIFICATION);
        pendingShopOwnerToken = jwtService.generateToken(pendingShopOwner);
    }

    @Test
    void noJwt_ProtectedForecast_Returns401() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forecastJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Authentication required"));
    }

    @Test
    void noJwt_ProtectedScenario_Returns401() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(scenarioJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void malformedJwt_ProtectedEndpoint_Returns401() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                .header("Authorization", "Bearer invalid-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forecastJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tamperedJwt_ProtectedEndpoint_Returns401() throws Exception {
        String[] parts = customerToken.split("\\.");
        String tampered = parts[0] + "." + parts[1] + "tamper." + parts[2];
        
        mockMvc.perform(post("/api/forecasts")
                .header("Authorization", "Bearer " + tampered)
                .contentType(MediaType.APPLICATION_JSON)
                .content(forecastJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void customer_ForecastEndpoint_Authorized() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(forecastJson))
                .andExpect(status().isOk());
    }

    @Test
    void customer_ScenarioEndpoint_Returns403() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(scenarioJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void pendingShopOwner_ScenarioEndpoint_Returns403() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .header("Authorization", "Bearer " + pendingShopOwnerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(scenarioJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void shopOwner_ForecastEndpoint_Authorized() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                .header("Authorization", "Bearer " + shopOwnerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(forecastJson))
                .andExpect(status().isOk());
    }

    @Test
    void shopOwner_ScenarioEndpoint_Returns403() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .header("Authorization", "Bearer " + shopOwnerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(scenarioJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void companyOwner_ScenarioEndpoint_Authorized() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .header("Authorization", "Bearer " + companyOwnerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(scenarioJson))
                .andExpect(status().isOk());
    }

    @Test
    void admin_ScenarioEndpoint_Authorized() throws Exception {
        mockMvc.perform(post("/api/scenarios")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(scenarioJson))
                .andExpect(status().isOk());
    }

    @Test
    void companyOwner_ForecastEndpoint_Authorized() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                .header("Authorization", "Bearer " + companyOwnerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(forecastJson))
                .andExpect(status().isOk());
    }
    
    @Test
    void admin_ProtectedEndpoint_Authorized() throws Exception {
        mockMvc.perform(post("/api/forecasts")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(forecastJson))
                .andExpect(status().isOk());
    }

    @Test
    void loginEndpoint_RemainsPublic() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nonexistent@example.com\", \"password\":\"test\"}"))
                .andExpect(status().isUnauthorized()); // It hits BadCredentialsException which is 401, not 403 or auth required filter block
    }
    
    @Test
    void registerEndpoint_RemainsPublic() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest()); // Hits validation errors, not 401
    }
}
