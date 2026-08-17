package com.team24.pharma.service;

import com.team24.pharma.domain.entity.ProductCategory;
import com.team24.pharma.domain.repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductCategoryRepository productCategoryRepository;

    public List<ProductCategory> getAllProducts() {
        return productCategoryRepository.findAll();
    }

    @Transactional
    public ProductCategory createProduct(ProductCategory product) {
        return productCategoryRepository.save(product);
    }

    @Transactional
    public ProductCategory updateProduct(Long id, ProductCategory updatedData) {
        Optional<ProductCategory> existingOpt = productCategoryRepository.findById(id);
        if (existingOpt.isPresent()) {
            ProductCategory existing = existingOpt.get();
            existing.setCategoryCode(updatedData.getCategoryCode());
            existing.setCategoryName(updatedData.getCategoryName());
            existing.setDescription(updatedData.getDescription());
            existing.setActive(updatedData.isActive());
            return productCategoryRepository.save(existing);
        }
        throw new IllegalArgumentException("Product not found");
    }

    @Transactional
    public void deleteProduct(Long id) {
        productCategoryRepository.deleteById(id);
    }
}
