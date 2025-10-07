ALTER TABLE public.sections
ADD COLUMN IF NOT EXISTS mobile_product_columns INT NOT NULL DEFAULT 1;