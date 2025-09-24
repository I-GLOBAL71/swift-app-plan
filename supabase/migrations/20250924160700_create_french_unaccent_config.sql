CREATE TEXT SEARCH CONFIGURATION public.french_unaccent ( COPY = french );
ALTER TEXT SEARCH CONFIGURATION public.french_unaccent
ALTER MAPPING FOR hword, hword_part, word
WITH unaccent, french_stem;