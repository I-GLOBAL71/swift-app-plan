export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      payment_methods: {
        Row: {
          id: string
          name: string
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // You can add other tables here as needed
      settings: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      cameroon_cities: {
        Row: {
          created_at: string
          delivery_days: number
          id: string
          is_active: boolean
          name: string
          payment_required_before_shipping: boolean
          region: string
          shipping_fee: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_days?: number
          id?: string
          is_active?: boolean
          name: string
          payment_required_before_shipping?: boolean
          region: string
          shipping_fee: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_days?: number
          id?: string
          is_active?: boolean
          name?: string
          payment_required_before_shipping?: boolean
          region?: string
          shipping_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          id: string
          image_url: string
          title: string
          subtitle: string
          link: string
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          title: string
          subtitle: string
          link: string
          created_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          title?: string
          subtitle?: string
          link?: string
          created_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          total_amount: number
          status: string
          city_id: string
          expected_delivery_date: string
          payment_method: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          total_amount: number
          status?: string
          city_id: string
          expected_delivery_date: string
          payment_method: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          total_amount?: number
          status?: string
          city_id?: string
          expected_delivery_date?: string
          payment_method?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          title: string
          price: number
          image_url: string | string[]
          is_premium: boolean
        }
        Insert: {
          id?: string
          title: string
          price: number
          image_url: string | string[]
          is_premium?: boolean
        }
        Update: {
          id?: string
          title?: string
          price?: number
          image_url?: string | string[]
          is_premium?: boolean
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
        }
        Relationships: []
      }
      product_relations: {
        Row: {
          product_id: string
          related_product_id: string
        }
        Insert: {
          product_id: string
          related_product_id: string
        }
        Update: {
          product_id?: string
          related_product_id?: string
        }
        Relationships: []
      }
      sub_categories: {
        Row: {
          id: string
          name: string
          parent_id: string
        }
        Insert: {
          id?: string
          name: string
          parent_id: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          id: string
          title: string
          type: string
          product_ids: string[] | null
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: string
          product_ids?: string[] | null
          category_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          product_ids?: string[] | null
          category_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          id: string
          platform: string
          url: string
        }
        Insert: {
          id?: string
          platform: string
          url: string
        }
        Update: {
          id?: string
          platform?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}