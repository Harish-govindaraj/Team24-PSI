package com.team24.pharma.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team24.pharma.domain.entity.ForecastResult;

@Repository
public interface ForecastResultRepository extends JpaRepository<ForecastResult, Long> {

    List<ForecastResult> findByCategoryCodeOrderByForecastDateAsc(String categoryCode);
}
