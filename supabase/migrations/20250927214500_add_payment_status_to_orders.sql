-- Add payment_status to orders table

ALTER TABLE public.orders
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';

-- Add an index for faster filtering
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);