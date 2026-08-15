package com.team24.pharma.domain.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "historical_sales")
public class HistoricalSale implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_code", nullable = false, length = 20)
    private String categoryCode;

    @Column(name = "sales_date", nullable = false)
    private LocalDate salesDate;

    @Column(name = "sales_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal salesQuantity;
}
