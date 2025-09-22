CREATE TABLE public.hero_slides (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    subtitle text,
    description text,
    image_url text,
    button_text text,
    button_link text,
    is_active boolean NOT NULL DEFAULT true,
    order_index integer NOT NULL DEFAULT 0,
    CONSTRAINT hero_slides_pkey PRIMARY KEY (id)
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.hero_slides FOR ALL USING (auth.uid() IS NOT NULL);