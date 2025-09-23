-- Alter the function to use SECURITY INVOKER
ALTER FUNCTION public.is_admin_user(user_uuid UUID) SECURITY INVOKER;