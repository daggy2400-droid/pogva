CREATE TABLE IF NOT EXISTS ratings (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id    INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review      TEXT,
    reviewer    VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ratings_product_id ON ratings(product_id);

CREATE OR REPLACE VIEW product_ratings_summary AS
SELECT
    product_id,
    COUNT(*)                  AS total_ratings,
    AVG(rating)::NUMERIC(3,2) AS average_rating
FROM ratings
GROUP BY product_id;
