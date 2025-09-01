-- Create sections table for customizable homepage sections
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  style_type TEXT NOT NULL DEFAULT 'grid',
  background_color TEXT DEFAULT 'transparent',
  text_color TEXT DEFAULT 'foreground',
  max_products INTEGER DEFAULT 8,
  show_premium_only BOOLEAN DEFAULT false,
  show_standard_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Create policies for sections
CREATE POLICY "Admin can manage sections" 
ON public.sections 
FOR ALL 
USING (is_admin_user());

CREATE POLICY "Public can read active sections" 
ON public.sections 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON public.sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections
INSERT INTO public.sections (title, description, position, style_type, max_products) VALUES
('Nos Produits Populaires', 'Découvrez notre sélection de produits les plus appréciés', 1, 'grid', 8),
('Collection Premium', 'Des pièces d''exception pour les occasions spéciales', 2, 'premium', 6);