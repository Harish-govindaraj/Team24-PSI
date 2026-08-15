package com.team24.pharma.domain.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team24.pharma.domain.entity.HistoricalSale;

@Repository
public interface HistoricalSaleRepository extends JpaRepository<HistoricalSale, Long> {

    List<HistoricalSale> findByCategoryCodeOrderBySalesDateAsc(String categoryCode);

    List<HistoricalSale> findByCategoryCodeAndSalesDateBetweenOrderBySalesDateAsc(
            String categoryCode, LocalDate startDate, LocalDate endDate);
}
