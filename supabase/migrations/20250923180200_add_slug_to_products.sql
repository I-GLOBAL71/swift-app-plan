ALTER TABLE products ADD COLUMN slug TEXT;

CREATE UNIQUE INDEX products_slug_idx ON products (slug);

CREATE OR REPLACE FUNCTION generate_slug(text)
RETURNS text AS $$
BEGIN
  RETURN trim(both '-' from regexp_replace(lower(unaccent($1)), '[^a-z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE products SET slug = generate_slug(title) WHERE slug IS NULL;

ALTER TABLE products ALTER COLUMN slug SET NOT NULL;