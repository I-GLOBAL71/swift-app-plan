-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow admin write access" ON public.payment_methods;

-- Create a new policy that allows admins to update
CREATE POLICY "Allow admin write access"
ON public.payment_methods
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());