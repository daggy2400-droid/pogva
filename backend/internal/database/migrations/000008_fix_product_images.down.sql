-- Revert image fixes (restore original landscape/wrong images)
UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80',
    'https://images.unsplash.com/photo-1584735935682-17e48efe3092?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&q=80'
  AND category IN ('Sandals', 'Sport Sandals');

UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80'
  AND category = 'Sneakers';

UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1519415510877-b4f4c2a5e9e4?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1519415510877-b4f4c2a5e9e4?w=600&q=80',
    'https://images.unsplash.com/photo-1551107696-a4b537da3188?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80'
  AND category = 'Casual Shoes';

UPDATE products SET
  image_url = 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80',
  images    = ARRAY[
    'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80',
    'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=600&q=80'
  ]
WHERE image_url = 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&q=80'
  AND category = 'Women''s Heels';

DELETE FROM hero_slides WHERE sort_order IN (1, 2, 3)
  AND title IN ('New Season Sneakers', 'Handcrafted Formal Shoes', 'Premium Boots Collection');
