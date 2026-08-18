-- =====================================================
-- PSI Update Confidence Score Decimal Precision
-- V7 Migration
-- =====================================================

ALTER TABLE forecast_result MODIFY confidence_score DECIMAL(6,2) NULL;
