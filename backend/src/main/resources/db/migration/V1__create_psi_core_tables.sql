-- =====================================================
-- PSI Core Tables
-- V1 Migration
-- =====================================================

-- 1. Product Category
CREATE TABLE product_category (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_code VARCHAR(20) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_product_category_code UNIQUE (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Historical Sales
CREATE TABLE historical_sales (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_code VARCHAR(20) NOT NULL,
    sales_date DATE NOT NULL,
    sales_quantity DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_historical_sales_category_date UNIQUE (category_code, sales_date),
    INDEX idx_historical_sales_category_date (category_code, sales_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Forecast Result
CREATE TABLE forecast_result (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_code VARCHAR(20) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_sales DECIMAL(12,2) NOT NULL,
    lower_bound DECIMAL(12,2) NULL,
    upper_bound DECIMAL(12,2) NULL,
    model_name VARCHAR(100) NOT NULL,
    trend VARCHAR(30) NULL,
    seasonality VARCHAR(30) NULL,
    confidence_score DECIMAL(5,4) NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_forecast_result_category_date (category_code, forecast_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
