import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Crown, Package, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  title: string;
  description: string;
  position: number;
  is_active: boolean;
  style_type: string;
  background_color: string;
  text_color: string;
  max_products: number;
  show_premium_only: boolean;
  show_standard_only: boolean;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  is_premium: boolean;
  is_active: boolean;
}

const DynamicSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sectionsResult, productsResult] = await Promise.all([
        supabase
          .from("sections")
          .select("*")
          .eq("is_active", true)
          .order("position", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
      ]);

      if (sectionsResult.error) throw sectionsResult.error;
      if (productsResult.error) throw productsResult.error;

      setSections(sectionsResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des sections");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = (section: Section) => {
    let filtered = products;

    if (section.show_premium_only) {
      filtered = filtered.filter(p => p.is_premium);
    } else if (section.show_standard_only) {
      filtered = filtered.filter(p => !p.is_premium);
    }

    return filtered.slice(0, section.max_products);
  };

  const getSectionIcon = (styleType: string) => {
    switch (styleType) {
      case "premium":
        return Crown;
      case "featured":
        return Star;
      case "carousel":
        return Sparkles;
      default:
        return Package;
    }
  };

  const getSectionBackgroundClass = (backgroundColor: string) => {
    switch (backgroundColor) {
      case "muted":
        return "bg-muted/50";
      case "accent":
        return "bg-accent/20";
      case "secondary":
        return "bg-secondary/30";
      default:
        return "";
    }
  };

  const renderSection = (section: Section) => {
    const filteredProducts = getFilteredProducts(section);
    const Icon = getSectionIcon(section.style_type);
    const backgroundClass = getSectionBackgroundClass(section.background_color);
    
    if (filteredProducts.length === 0) return null;

    return (
      <div
        key={section.id}
        className={`${backgroundClass} ${backgroundClass ? "rounded-3xl p-8 md:p-12" : ""}`}
      >
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon className={`w-8 h-8 ${section.style_type === "premium" ? "text-premium" : "text-primary"}`} />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {section.title}
            </h2>
          </div>
          {section.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {section.description}
            </p>
          )}
        </div>

        {section.style_type === "carousel" ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {filteredProducts.map((product) => (
                <div key={product.id} className="w-80 flex-shrink-0">
                  <ProductCard
                    title={product.title}
                    price={product.price}
                    image={product.image_url}
                    isPremium={product.is_premium}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : section.style_type === "featured" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                <ProductCard
                  title={product.title}
                  price={product.price}
                  image={product.image_url}
                  isPremium={product.is_premium}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                price={product.price}
                image={product.image_url}
                isPremium={product.is_premium}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            variant={section.style_type === "premium" ? "premium" : "outline"} 
            size="lg"
          >
            {section.show_premium_only 
              ? "Explorer la collection Premium"
              : section.show_standard_only 
              ? "Voir tous les produits standards"
              : "Voir plus de produits"
            }
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-lg">Chargement des sections...</div>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aucune section configurée</h2>
          <p className="text-muted-foreground">
            Les sections personnalisées apparaîtront ici une fois configurées dans l'admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {sections.map(renderSection)}
    </div>
  );
};

export default DynamicSections;