-- Add new columns for product selection logic in sections
-- Add new columns for product selection logic in sections, if they don't exist
ALTER TABLE public.sections
ADD COLUMN IF NOT EXISTS show_premium_only BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS show_standard_only BOOLEAN NOT NULL DEFAULT false;

-- Create a custom type for selection_mode, if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'section_selection_mode') THEN
        CREATE TYPE public.section_selection_mode AS ENUM ('automatic', 'manual', 'mixed');
    END IF;
END$$;

-- Add the selection_mode column with the new type, if it doesn't exist
ALTER TABLE public.sections
ADD COLUMN IF NOT EXISTS selection_mode public.section_selection_mode NOT NULL DEFAULT 'automatic';

-- Backfill existing rows to ensure data consistency, only if not already set
UPDATE public.sections
SET show_standard_only = true
WHERE style_type = 'grid' AND show_standard_only = false;

-- Optional: Add a check constraint for more complex logic if needed in the future
-- ALTER TABLE public.sections
-- ADD CONSTRAINT check_selection_logic
-- CHECK (
--   (show_premium_only AND NOT show_standard_only) OR
--   (NOT show_premium_only AND show_standard_only) OR
--   (NOT show_premium_only AND NOT show_standard_only)
-- );