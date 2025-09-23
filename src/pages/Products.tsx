import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { Package, ShoppingBag, ArrowRight, Star, Heart, Shield } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import PremiumAccessButton from "@/components/PremiumAccessButton";
import { Product } from "@/lib/types";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { premiumSectionFrequency } = useSettings();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, slug")
        .eq("is_premium", false)
        .eq("is_active", true);

      if (error) throw error;
      setProducts(data as Product[] || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Découvrez Nos Trésors
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Chaque article est une promesse de qualité et d'innovation. Trouvez votre bonheur parmi notre sélection exclusive.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center">
            <div className="text-lg">Chargement des produits...</div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.reduce((acc, product, index) => {
              acc.push(
                <div
                  key={product.id}
                  className="transform hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              );

              if ((index + 1) % premiumSectionFrequency === 0) {
                acc.push(
                  <div key={`premium-${index}`} className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                    <PremiumAccessButton />
                  </div>
                );
              }

              return acc;
            }, [] as JSX.Element[])}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Aucun produit disponible</h3>
            <p className="text-muted-foreground">
              Notre sélection de produits est en cours de préparation. Revenez bientôt !
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;