CREATE TABLE public.pages (
    id bigint NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.pages OWNER TO postgres;

CREATE SEQUENCE public.pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.pages_id_seq OWNER TO postgres;

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_slug_key UNIQUE (slug);

-- RLS Policies
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.pages FOR SELECT USING (true);

CREATE POLICY "Allow admin write access" ON public.pages FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Initial Data
INSERT INTO public.pages (slug, title, content) VALUES
('about', 'À Propos de Swift App Plan', '{"description": "Bienvenue sur Swift App Plan...", "team": "Notre équipe est composée..."}'),
('delivery', 'Politique de Livraison', '{"shipping_times": "5 à 7 jours...", "shipping_costs": "Calculés au paiement...", "order_tracking": "Email avec numéro de suivi..."}'),
('returns', 'Politique de Retours', '{"return_conditions": "30 jours...", "return_procedure": "Contactez le support...", "refunds": "5 à 10 jours..."}'),
('support', 'Contactez-nous', '{"email": "support@swiftappplan.com", "phone": "+1 (234) 567-890"}'),
('privacy-policy', 'Politique de Confidentialité', '{"introduction": "Introduction...", "data_collection": "Collecte des données..."}'),
('terms-of-service', 'Conditions d''Utilisation', '{"introduction": "Introduction...", "user_obligations": "Obligations de l''utilisateur..."}');
