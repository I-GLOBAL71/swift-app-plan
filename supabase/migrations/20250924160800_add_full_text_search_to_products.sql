-- 1. Add the 'fts' tsvector column
ALTER TABLE public.products ADD COLUMN fts tsvector;

-- 2. Create a function to update the tsvector column
CREATE OR REPLACE FUNCTION public.update_products_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('french_unaccent', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '') || ' ' || coalesce(array_to_string(NEW.synonyms, ' '), ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to automatically update the fts column
CREATE TRIGGER products_fts_update
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_products_fts();

-- 4. Update existing rows to populate the fts column
UPDATE public.products SET fts = to_tsvector('french_unaccent', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(array_to_string(synonyms, ' '), ''));

-- 5. Create a GIN index for fast full-text search
CREATE INDEX products_fts_idx ON public.products USING gin (fts);