-- Add function columns and update payment_methods for My-CoolPay

BEGIN;

-- Add columns for Supabase function integration to payment_methods table
ALTER TABLE public.payment_methods
ADD COLUMN IF NOT EXISTS function_name TEXT,
ADD COLUMN IF NOT EXISTS callback_function_name TEXT,
ADD COLUMN IF NOT EXISTS documentation_link TEXT;

-- Add a unique constraint to the name column to allow ON CONFLICT to work
ALTER TABLE public.payment_methods ADD CONSTRAINT payment_methods_name_key UNIQUE (name);

-- Disable the old 'CoolPay' method
UPDATE public.payment_methods
SET enabled = false
WHERE name = 'CoolPay';

-- Upsert the new 'MyCoolPay' method with correct configuration
INSERT INTO public.payment_methods (name, enabled, function_name, callback_function_name, documentation_link)
VALUES 
('MyCoolPay', true, 'create-mycoolpay-payment', 'mycoolpay-callback', 'https://documenter.getpostman.com/view/10808728/TzK2bEa8')
ON CONFLICT (name) DO UPDATE 
SET 
  enabled = true,
  function_name = 'create-mycoolpay-payment',
  callback_function_name = 'mycoolpay-callback',
  documentation_link = 'https://documenter.getpostman.com/view/10808728/TzK2bEa8',
  updated_at = now();

COMMIT;