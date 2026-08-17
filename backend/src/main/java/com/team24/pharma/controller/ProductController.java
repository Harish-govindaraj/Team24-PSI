package com.team24.pharma.controller;

import com.team24.pharma.domain.entity.ProductCategory;
import com.team24.pharma.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER', 'PHARMA_SHOP_OWNER', 'PHARMA_COMPANY_OWNER', 'ADMIN')")
public class ProductController {

    private final AdminProductService adminProductService;

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        List<ProductCategory> products = adminProductService.getAllProducts();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products
        ));
    }
}
