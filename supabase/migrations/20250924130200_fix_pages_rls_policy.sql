-- Drop the existing policy
DROP POLICY "Allow admin write access" ON public.pages;

-- Create a new policy that checks for admin privileges
CREATE POLICY "Allow admin write access" ON public.pages FOR ALL
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));