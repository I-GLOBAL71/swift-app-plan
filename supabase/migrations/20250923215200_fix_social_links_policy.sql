-- Drop the old, incorrect policy
DROP POLICY IF EXISTS "Admins can manage social links" ON public.social_links;

-- Create a new policy with both USING and WITH CHECK clauses
CREATE POLICY "Admins can manage social links" 
ON public.social_links 
FOR ALL 
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));