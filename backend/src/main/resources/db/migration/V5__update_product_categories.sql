-- Add new columns to existing product_category table
ALTER TABLE product_category ADD COLUMN description TEXT;
ALTER TABLE product_category ADD COLUMN active BOOLEAN DEFAULT TRUE;
ALTER TABLE product_category ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE product_category ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Insert or update categories
INSERT INTO product_category (category_code, category_name, description, active) VALUES
('M01AB', 'Anti-inflammatory and antirheumatic products, non-steroids', 'Acetic acid derivatives and related substances', TRUE),
('M01AE', 'Anti-inflammatory and antirheumatic products, non-steroids', 'Propionic acid derivatives', TRUE),
('N02BA', 'Other analgesics and antipyretics', 'Salicylic acid and derivatives', TRUE),
('R03AC', 'Drugs for obstructive airway diseases', 'Selective beta-2-adrenoreceptor agonists', TRUE),
('A10BA', 'Drugs used in diabetes', 'Biguanides', TRUE),
('C09AA', 'Agents acting on the renin-angiotensin system', 'ACE inhibitors, plain', TRUE),
('J01CA', 'Antibacterials for systemic use', 'Penicillins with extended spectrum', TRUE),
('L04AA', 'Immunosuppressants', 'Selective immunosuppressants', TRUE)
ON DUPLICATE KEY UPDATE
category_name = VALUES(category_name),
description = VALUES(description),
active = VALUES(active);
