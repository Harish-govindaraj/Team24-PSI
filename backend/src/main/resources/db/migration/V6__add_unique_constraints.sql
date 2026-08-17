-- =====================================================
-- PSI Add Unique Constraints
-- V6 Migration
-- =====================================================

-- Add unique constraint for phone number
ALTER TABLE users ADD CONSTRAINT uk_users_phone_number UNIQUE (phone_number);

-- Add unique constraint for registration ID scoped by role
ALTER TABLE users ADD CONSTRAINT uk_users_role_reg_id UNIQUE (requested_role, business_registration_id);
