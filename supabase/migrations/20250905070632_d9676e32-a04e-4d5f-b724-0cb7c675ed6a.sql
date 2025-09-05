-- Add delivery_days column to cameroon_cities table for order tracking
ALTER TABLE public.cameroon_cities 
ADD COLUMN delivery_days integer NOT NULL DEFAULT 3;

-- Add delivery_address column to orders table  
ALTER TABLE public.orders 
ADD COLUMN delivery_address text,
ADD COLUMN city_id uuid REFERENCES public.cameroon_cities(id),
ADD COLUMN expected_delivery_date timestamp with time zone,
ADD COLUMN payment_method text DEFAULT 'cash_on_delivery';