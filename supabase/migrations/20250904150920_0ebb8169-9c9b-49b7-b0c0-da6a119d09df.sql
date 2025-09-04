-- Create table for Cameroon cities with shipping fees and payment settings
CREATE TABLE public.cameroon_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  shipping_fee INTEGER NOT NULL DEFAULT 0, -- in cents
  payment_required_before_shipping BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cameroon_cities ENABLE ROW LEVEL SECURITY;

-- Admin can manage cities
CREATE POLICY "Admin can manage cities" 
ON public.cameroon_cities 
FOR ALL 
USING (is_admin_user());

-- Public can read active cities
CREATE POLICY "Public can read active cities" 
ON public.cameroon_cities 
FOR SELECT 
USING (is_active = true);

-- Insert major Cameroon cities
INSERT INTO public.cameroon_cities (name, region, shipping_fee, payment_required_before_shipping) VALUES
-- Centre
('Yaoundé', 'Centre', 150000, true), -- 1500 XAF
('Mbalmayo', 'Centre', 200000, false),
('Bafia', 'Centre', 250000, false),
('Ntui', 'Centre', 300000, false),
-- Littoral
('Douala', 'Littoral', 150000, true), -- 1500 XAF
('Edéa', 'Littoral', 200000, false),
('Nkongsamba', 'Littoral', 250000, false),
-- Ouest
('Bafoussam', 'Ouest', 300000, false),
('Dschang', 'Ouest', 350000, false),
('Mbouda', 'Ouest', 350000, false),
-- Nord-Ouest
('Bamenda', 'Nord-Ouest', 400000, false),
('Kumbo', 'Nord-Ouest', 450000, false),
-- Sud-Ouest
('Buea', 'Sud-Ouest', 350000, false),
('Limbe', 'Sud-Ouest', 350000, false),
('Kumba', 'Sud-Ouest', 400000, false),
-- Nord
('Garoua', 'Nord', 500000, false),
('Maroua', 'Nord', 600000, false),
-- Extrême-Nord
('Maroua', 'Extrême-Nord', 600000, false),
('Mokolo', 'Extrême-Nord', 700000, false),
-- Est
('Bertoua', 'Est', 450000, false),
('Batouri', 'Est', 500000, false),
-- Sud
('Ebolowa', 'Sud', 300000, false),
('Sangmélima', 'Sud', 350000, false),
('Kribi', 'Sud', 300000, false),
('Campo', 'Sud', 400000, false),
-- Adamaoua
('Ngaoundéré', 'Adamaoua', 500000, false),
('Tibati', 'Adamaoua', 550000, false);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cameroon_cities_updated_at
BEFORE UPDATE ON public.cameroon_cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();