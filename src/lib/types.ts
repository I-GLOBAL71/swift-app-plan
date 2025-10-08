// Types pour les produits
export interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | string[];
  is_premium: boolean;
  keywords?: string[];
  synonyms?: string[];
  is_active?: boolean;
  similar_products_type?: 'auto' | 'manual';
  created_at?: string;
  category_id?: string | null;
  sub_category_id?: string | null;
  priority_image_index?: number | null;
}

// Types pour les catégories
export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
}

export interface SubCategory {
  id: string;
  name: string;
  parent_id: string;
}

// Types pour les commandes
export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total_amount: number;
  status: string;
  city_id: string;
  expected_delivery_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  payment_status?: string;
  updated_at?: string;
}

// Types pour les slides hero (structure réelle de la table)
export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
  created_at: string;
}

// Types pour les liens sociaux
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

// Types pour les pages
export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
}

// Types pour les sections
export interface Section {
  id: string;
  title: string;
  type: string;
  product_ids: string[] | null;
  category_id: string | null;
  created_at: string;
}

// Types pour les relations de produits
export interface ProductRelation {
  product_id: string;
  related_product_id: string;
}