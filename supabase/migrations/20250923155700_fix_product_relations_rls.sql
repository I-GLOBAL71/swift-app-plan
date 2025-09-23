-- Drop the old restrictive policy
DROP POLICY "Allow admin users to manage product relations" ON public.product_relations;

-- Create a new policy that allows authenticated admin users to manage relations
CREATE POLICY "Allow admin users to manage product relations"
ON public.product_relations
FOR ALL
TO authenticated
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));