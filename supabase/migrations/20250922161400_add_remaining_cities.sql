-- Insert remaining Cameroon cities with a default shipping fee of 2500 FCFA

INSERT INTO public.cameroon_cities (name, region, shipping_fee, payment_required_before_shipping, delivery_days) VALUES
-- Centre
('Mfou', 'Centre', 250000, false, 3),
('Obala', 'Centre', 250000, false, 3),
('Monatélé', 'Centre', 250000, false, 3),
('Akonolinga', 'Centre', 250000, false, 3),
('Ngoumou', 'Centre', 250000, false, 3),

-- Littoral
('Loum', 'Littoral', 250000, false, 3),
('Mbanga', 'Littoral', 250000, false, 3),
('Penja', 'Littoral', 250000, false, 3),
('Yabassi', 'Littoral', 250000, false, 3),
('Tiko', 'Littoral', 250000, false, 3),

-- Ouest
('Bandjoun', 'Ouest', 250000, false, 3),
('Foumban', 'Ouest', 250000, false, 3),
('Bafang', 'Ouest', 250000, false, 3),
('Bangangté', 'Ouest', 250000, false, 3),
('Baham', 'Ouest', 250000, false, 3),
('Kékem', 'Ouest', 250000, false, 3),
('Foumbot', 'Ouest', 250000, false, 3),

-- Nord-Ouest
('Wum', 'Nord-Ouest', 250000, false, 3),
('Ndop', 'Nord-Ouest', 250000, false, 3),
('Bali', 'Nord-Ouest', 250000, false, 3),
('Batibo', 'Nord-Ouest', 250000, false, 3),
('Mbengwi', 'Nord-Ouest', 250000, false, 3),
('Nkambe', 'Nord-Ouest', 250000, false, 3),
('Fundong', 'Nord-Ouest', 250000, false, 3),
('Jakiri', 'Nord-Ouest', 250000, false, 3),

-- Sud-Ouest
('Mamfé', 'Sud-Ouest', 250000, false, 3),
('Fontem', 'Sud-Ouest', 250000, false, 3),
('Bangem', 'Sud-Ouest', 250000, false, 3),
('Mundemba', 'Sud-Ouest', 250000, false, 3),
('Nguti', 'Sud-Ouest', 250000, false, 3),
('Konye', 'Sud-Ouest', 250000, false, 3),
('Alou', 'Sud-Ouest', 250000, false, 3),

-- Adamaoua
('Meiganga', 'Adamaoua', 250000, false, 3),
('Tibati', 'Adamaoua', 250000, false, 3),
('Tignère', 'Adamaoua', 250000, false, 3),
('Banyo', 'Adamaoua', 250000, false, 3),
('Kontcha', 'Adamaoua', 250000, false, 3),
('Dir', 'Adamaoua', 250000, false, 3),
('Galim', 'Adamaoua', 250000, false, 3),
('Nganha', 'Adamaoua', 250000, false, 3),
('Mayo-Baléo', 'Adamaoua', 250000, false, 3),

-- Nord
('Guider', 'Nord', 250000, false, 3),
('Figuil', 'Nord', 250000, false, 3),
('Pitoa', 'Nord', 250000, false, 3),
('Tcholliré', 'Nord', 250000, false, 3),
('Rey-Bouba', 'Nord', 250000, false, 3),
('Lagdo', 'Nord', 250000, false, 3),
('Bibémi', 'Nord', 250000, false, 3),
('Touboro', 'Nord', 250000, false, 3),

-- Extrême-Nord
('Kousséri', 'Extrême-Nord', 250000, false, 3),
('Yagoua', 'Extrême-Nord', 250000, false, 3),
('Mora', 'Extrême-Nord', 250000, false, 3),
('Kaélé', 'Extrême-Nord', 250000, false, 3),
('Guidiguis', 'Extrême-Nord', 250000, false, 3),
('Waza', 'Extrême-Nord', 250000, false, 3),
('Blangoua', 'Extrême-Nord', 250000, false, 3),
('Fotokol', 'Extrême-Nord', 250000, false, 3),

-- Est
('Yokadouma', 'Est', 250000, false, 3),
('Abong-Mbang', 'Est', 250000, false, 3),
('Belabo', 'Est', 250000, false, 3),
('Kenzou', 'Est', 250000, false, 3),
('Ndelélé', 'Est', 250000, false, 3),
('Garoua-Boulaï', 'Est', 250000, false, 3),
('Mindourou', 'Est', 250000, false, 3),
('Doumé', 'Est', 250000, false, 3),

-- Sud
('Ambam', 'Sud', 250000, false, 3),
('Lolodorf', 'Sud', 250000, false, 3),
('Djoum', 'Sud', 250000, false, 3),
('Mvangan', 'Sud', 250000, false, 3),
('Akom II', 'Sud', 250000, false, 3),
('Ma''an', 'Sud', 250000, false, 3)
ON CONFLICT (name) DO NOTHING;