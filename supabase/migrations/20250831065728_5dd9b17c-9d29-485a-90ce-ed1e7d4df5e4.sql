-- Create settings table for API keys and configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin can manage settings" 
ON public.settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 
  FROM admin_users 
  WHERE admin_users.user_id = auth.uid() 
  AND admin_users.is_active = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Gemini API key setting
INSERT INTO public.settings (key, value, description) 
VALUES ('gemini_api_key', '', 'Clé API Google Gemini pour l''IA générative');