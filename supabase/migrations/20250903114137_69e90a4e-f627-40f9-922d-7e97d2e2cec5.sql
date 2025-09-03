-- Modifier la colonne image_url pour supporter les tableaux JSON
ALTER TABLE public.products 
ALTER COLUMN image_url TYPE jsonb USING 
CASE 
  WHEN image_url IS NULL THEN NULL
  WHEN image_url = '' THEN NULL
  ELSE jsonb_build_array(image_url)
END;