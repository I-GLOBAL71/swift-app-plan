-- Create the categories table
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_name_key UNIQUE (name)
);

-- Enable RLS for the categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for the categories table
CREATE POLICY "Allow public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON public.categories FOR ALL USING (public.is_admin_user(auth.uid()));


-- Create the sub_categories table
CREATE TABLE public.sub_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sub_categories_pkey PRIMARY KEY (id),
    CONSTRAINT sub_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE
);

-- Enable RLS for the sub_categories table
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for the sub_categories table
CREATE POLICY "Allow public read access" ON public.sub_categories FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON public.sub_categories FOR ALL USING (public.is_admin_user(auth.uid()));

-- Add category and sub_category columns to the products table
ALTER TABLE public.products
ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN sub_category_id uuid REFERENCES public.sub_categories(id) ON DELETE SET NULL;
