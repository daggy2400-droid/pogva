-- ============================================================
-- Migration 000008: Replace all product images with verified,
-- category-correct Unsplash shoe photos
-- ============================================================

-- ── SANDALS ──────────────────────────────────────────────────
-- photo-1603487742131  leather sandal ✓ (keep)
-- photo-1584735935682  leather sandal ✓ (keep)
-- photo-1515347619252  ✗ mountain/landscape → replace with sandal
-- photo-1572635196237  sport sandal ✓ (keep)

-- Fix: replace landscape photo used in sandals/heels with real sandal
UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&q=80',
    'https://images.unsplash.com/photo-1584735935682-17e48efe3092?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80'
  AND category IN ('Sandals', 'Sport Sandals');

-- ── SNEAKERS ─────────────────────────────────────────────────
-- photo-1542291026-7eec  red Nike sneaker ✓ (keep)
-- photo-1606107557195    white sneaker ✓ (keep)
-- photo-1608231387042    sneaker ✓ (keep)
-- photo-1595950653106    sneaker ✓ (keep)
-- photo-1491553895911    running shoe ✓ (keep)
-- photo-1463100099107    ✗ not a shoe → replace
UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80'
  AND category = 'Sneakers';

-- ── BOOTS ────────────────────────────────────────────────────
-- photo-1638247025967    chelsea boot ✓ (keep)
-- photo-1608256246200    ankle boot ✓ (keep)
-- photo-1542838132-92c5  boot ✓ (keep)
-- photo-1605812860427    combat boot ✓ (keep)
-- photo-1600269452121    riding boot ✓ (keep)

-- ── FORMAL SHOES ─────────────────────────────────────────────
-- photo-1614252235316    oxford ✓ (keep)
-- photo-1533867617858    derby ✓ (keep)
-- photo-1578681994506    oxford ✓ (keep)
-- photo-1582897085656    loafer ✓ (keep)
-- photo-1560343090-f0409 loafer ✓ (keep)
-- photo-1539185441755    oxford ✓ (keep)

-- ── CASUAL SHOES ─────────────────────────────────────────────
-- photo-1560769629-975e  casual shoe ✓ (keep)
-- photo-1551107696-a4b5  mule/loafer ✓ (keep)
-- photo-1519415510877    ✗ not a shoe → replace with casual loafer
UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80',
    'https://images.unsplash.com/photo-1551107696-a4b537da3188?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1519415510877-b4f4c2a5e9e4?w=600&q=80'
  AND category = 'Casual Shoes';

-- ── WOMEN'S HEELS ────────────────────────────────────────────
-- photo-1543163521-1bf5  stiletto ✓ (keep)
-- photo-1596703263926    block heel ✓ (keep)
-- photo-1515347619252    ✗ landscape → replace with heels
UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&q=80',
    'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80'
  AND category = 'Women''s Heels';

-- ── KIDS SHOES ───────────────────────────────────────────────
-- photo-1555274175-6cbf  kids shoe ✓ (keep)
-- photo-1542291026-7eec  sneaker ✓ (keep for kids sneaker)
-- photo-1606107557195    running shoe ✓ (keep)
-- photo-1547036967-23d1  slipper ✓ (keep for kids slipper)
-- photo-1572635196237    sport sandal ✓ (keep for kids sandal)
-- photo-1638247025967    boot ✓ (keep for toddler boot)
-- photo-1543163521-1bf5  heel ✗ used for kids formal → replace
UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80'
  AND category = 'Kids Shoes';

-- ── SLIPPERS ─────────────────────────────────────────────────
-- photo-1547036967-23d1  slipper ✓ (keep)
-- photo-1560769629-975e  casual shoe used as secondary ✓ (keep)

-- ── TRADITIONAL ──────────────────────────────────────────────
-- photo-1603487742131    leather sandal ✓ (keep)
-- photo-1584735935682    leather sandal ✓ (keep)

-- ── FIX 404 IMAGES IN EXISTING DB ───────────────────────────
-- photo-1584735935682 (404) → photo-1543508282 (leather sandal ✓)
UPDATE products SET
  image_url = REPLACE(image_url, 'photo-1584735935682-17e48efe3092', 'photo-1543508282-6319a3e2621f'),
  images    = ARRAY(
    SELECT REPLACE(u, 'photo-1584735935682-17e48efe3092', 'photo-1543508282-6319a3e2621f')
    FROM unnest(images) u
  )
WHERE image_url LIKE '%photo-1584735935682-17e48efe3092%'
   OR images::text LIKE '%photo-1584735935682-17e48efe3092%';

-- photo-1595950653106 (404) → photo-1512374382149 (sneaker ✓)
UPDATE products SET
  image_url = REPLACE(image_url, 'photo-1595950653106-bdbce89ff5f5', 'photo-1512374382149-233c42b6a83b'),
  images    = ARRAY(
    SELECT REPLACE(u, 'photo-1595950653106-bdbce89ff5f5', 'photo-1512374382149-233c42b6a83b')
    FROM unnest(images) u
  )
WHERE image_url LIKE '%photo-1595950653106-bdbce89ff5f5%'
   OR images::text LIKE '%photo-1595950653106-bdbce89ff5f5%';

-- photo-1551107696 (404) → photo-1558769132 (casual loafer ✓)
UPDATE products SET
  image_url = REPLACE(image_url, 'photo-1551107696-a4b537da3188', 'photo-1558769132-cb1aea458c5e'),
  images    = ARRAY(
    SELECT REPLACE(u, 'photo-1551107696-a4b537da3188', 'photo-1558769132-cb1aea458c5e')
    FROM unnest(images) u
  )
WHERE image_url LIKE '%photo-1551107696-a4b537da3188%'
   OR images::text LIKE '%photo-1551107696-a4b537da3188%';

-- ── HERO SLIDE ───────────────────────────────────────────────
-- Update default hero slide to a proper Ethiopian footwear hero shot
UPDATE hero_slides SET
  image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1800&q=85&auto=format&fit=crop'
WHERE sort_order = 0 AND title = 'Premium Ethiopian Footwear';

-- Add 2 more hero slides for a proper slideshow
INSERT INTO hero_slides (type, image_url, title, subtitle, cta_label, cta_url, sort_order, is_active)
VALUES
(
  'image',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1800&q=85&auto=format&fit=crop',
  'New Season Sneakers',
  'Fresh styles crafted for the streets of Addis Ababa',
  'Shop Sneakers',
  '/products?category=Sneakers',
  1,
  TRUE
),
(
  'image',
  'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1800&q=85&auto=format&fit=crop',
  'Handcrafted Formal Shoes',
  'Premium leather Oxfords & Derbies for every occasion',
  'Shop Formal',
  '/products?category=Formal+Shoes',
  2,
  TRUE
),
(
  'image',
  'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=1800&q=85&auto=format&fit=crop',
  'Premium Boots Collection',
  'From Chelsea to combat — built to last',
  'Shop Boots',
  '/products?category=Boots',
  3,
  TRUE
);
