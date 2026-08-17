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
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        List<ProductCategory> products = adminProductService.getAllProducts();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody ProductCategory product) {
        ProductCategory created = adminProductService.createProduct(product);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable Long id, @RequestBody ProductCategory product) {
        ProductCategory updated = adminProductService.updateProduct(id, product);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product deleted successfully"
        ));
    }
}
