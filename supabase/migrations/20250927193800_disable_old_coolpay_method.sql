-- Disable the old 'CoolPay' payment method to avoid duplicates in the UI

BEGIN;

UPDATE public.payment_methods
SET enabled = false
WHERE name = 'CoolPay';

COMMIT;