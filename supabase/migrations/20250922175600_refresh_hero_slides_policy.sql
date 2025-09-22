-- Drop the existing policy to ensure a clean slate
DROP POLICY IF EXISTS "Allow admin write access" ON public.hero_slides;

-- Recreate the policy to ensure it's correctly applied and the schema is refreshed
CREATE POLICY "Allow admin write access"
ON public.hero_slides
FOR ALL
USING (auth.uid() IS NOT NULL);