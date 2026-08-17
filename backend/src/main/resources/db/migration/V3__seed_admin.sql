INSERT INTO users (full_name, email, password_hash, role, requested_role, verification_status, created_at, updated_at) 
VALUES ('System Admin', 'admin@example.com', 'admin123', 'ROLE_ADMIN', 'ADMIN', 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
