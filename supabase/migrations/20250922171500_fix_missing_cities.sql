-- Update existing city names to match the provided list and add accents for consistency.
UPDATE public.cameroon_cities SET name = 'Buéa' WHERE name = 'Buea';
UPDATE public.cameroon_cities SET name = 'Mamfé' WHERE name = 'Mamfé';
UPDATE public.cameroon_cities SET name = 'Limbé' WHERE name = 'Limbe' AND region = 'Sud-Ouest';

-- Insert the remaining missing cities.
-- For cities that exist in multiple regions, the region is appended to the name to avoid unique name conflicts.
INSERT INTO public.cameroon_cities (name, region, shipping_fee, payment_required_before_shipping, delivery_days) VALUES
('Eséka', 'Centre', 250000, false, 3),
('Kribi (Littoral)', 'Littoral', 250000, false, 3),
('Limbe (Littoral)', 'Littoral', 250000, false, 3)
ON CONFLICT (name) DO NOTHING;