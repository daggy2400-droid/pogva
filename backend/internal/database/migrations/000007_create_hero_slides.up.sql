CREATE TABLE IF NOT EXISTS hero_slides (
  id         SERIAL PRIMARY KEY,
  type       VARCHAR(10) NOT NULL DEFAULT 'image' CHECK (type IN ('image','video','mixed')),
  image_url  TEXT,
  video_url  TEXT,
  title      TEXT,
  subtitle   TEXT,
  cta_label  TEXT,
  cta_url    TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default slide so the hero always has content
INSERT INTO hero_slides (type, image_url, title, subtitle, cta_label, cta_url, sort_order)
VALUES (
  'image',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1800&q=85&auto=format&fit=crop',
  'Premium Ethiopian Footwear',
  'Handcrafted shoes, sandals & boots for every occasion',
  'Shop Now',
  '/products',
  0
);
