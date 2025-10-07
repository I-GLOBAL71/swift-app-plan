ALTER TABLE public.products
ADD COLUMN priority_image_index INTEGER DEFAULT 0;

-- Mettre à jour la policy pour autoriser la modification de la nouvelle colonne
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.products;

CREATE POLICY "Enable all access for authenticated users"
ON public.products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);