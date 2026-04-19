ALTER TABLE products ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_products_is_premium ON products(is_premium);

-- Mark existing products with price >= 10000 as premium
UPDATE products SET is_premium = TRUE WHERE price >= 10000;
