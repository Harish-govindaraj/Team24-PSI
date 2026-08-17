package com.team24.pharma.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/admin/health")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHealthController {

    private final DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        Map<String, String> status = new HashMap<>();
        
        // Backend Status
        status.put("backend", "UP");

        // Database Status
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(1000)) {
                status.put("database", "UP");
            } else {
                status.put("database", "DOWN");
            }
        } catch (Exception e) {
            status.put("database", "DOWN");
        }

        // ML Service Status (mock or actual ping if possible)
        try {
            RestTemplate restTemplate = new RestTemplate();
            // Assuming ML service runs on 8000. For health check we can ping /health if it exists,
            // or just try to connect to the port. For safety, we'll assume it's UP if the rest template gets any response or 404.
            ResponseEntity<String> response = restTemplate.getForEntity("http://localhost:8000/", String.class);
            status.put("mlService", "UP");
        } catch (Exception e) {
            status.put("mlService", "DOWN");
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", status
        ));
    }
}
