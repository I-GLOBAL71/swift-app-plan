import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { Package, SearchX } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import PremiumAccessButton from "@/components/PremiumAccessButton";
import { Product } from "@/lib/types";
import BackToProductsBanner from "@/components/BackToProductsBanner";
import { CategoriesBar } from "@/components/CategoriesBar";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { premiumSectionFrequency, productGridColumns, mobileProductGridColumns } = useSettings();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const categoryQuery = searchParams.get("category");
  const subcategoryQuery = searchParams.get("subcategory");

  useEffect(() => {
    loadProducts(searchQuery, categoryQuery, subcategoryQuery);
  }, [searchQuery, categoryQuery, subcategoryQuery]);

  const loadProducts = async (query: string | null, category: string | null, subcategory: string | null) => {
    setLoading(true);
    try {
      let queryBuilder: any = supabase
        .from("products")
        .select("*")
        .eq("is_premium", false)
        .eq("is_active", true);

      if (query) {
        const plainQuery = query.split(/\s+/).join(" & ");
        queryBuilder = queryBuilder.textSearch("fts", plainQuery, {
          type: "plain",
          config: "french_unaccent",
        });
      }

      // Order by creation date to see new products first
      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data as Product[] || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <div className="text-center py-16">
          <SearchX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Aucun résultat</h3>
          <p className="text-muted-foreground">
            Nous n'avons trouvé aucun produit pour votre recherche "{searchQuery}".
          </p>
        </div>
      );
    }
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Aucun produit disponible</h3>
        <p className="text-muted-foreground">
          Notre sélection de produits est en cours de préparation. Revenez bientôt !
        </p>
      </div>
    );
  };

  const getGridColsClass = (cols: number, mobileCols?: number) => {
    const getMobileColsClass = (cols: number) => {
        switch (cols) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            default: return 'grid-cols-1';
        }
    }

    const desktopCols = (() => {
        switch (cols) {
            case 1: return 'sm:grid-cols-1';
            case 2: return 'sm:grid-cols-2';
            case 3: return 'md:grid-cols-3';
            case 4: return 'lg:grid-cols-4';
            case 5: return 'lg:grid-cols-5';
            default: return 'md:grid-cols-3';
        }
    })();

    return `${getMobileColsClass(mobileCols ?? 1)} ${desktopCols}`;
  };

  const gridColsClass = getGridColsClass(productGridColumns, mobileProductGridColumns);

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {searchQuery ? `Résultats pour "${searchQuery}"` : (subcategoryQuery || categoryQuery || "Découvrez Nos Trésors")}
          </h1>
          {!searchQuery && (
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Chaque article est une promesse de qualité et d'innovation. Trouvez votre bonheur parmi notre sélection exclusive.
            </p>
          )}
        </div>

        <div className="mb-8">
          <CategoriesBar />
        </div>
        
        {loading ? (
          <div className="text-center">
            <div className="text-lg">Chargement des produits...</div>
          </div>
        ) : products.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-6 mb-12 items-stretch`}>
            {products.reduce((acc, product, index) => {
              acc.push(
                <div
                  key={product.id}
                  className="transform hover:scale-105 transition-transform duration-300 h-full"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              );

              if ((index + 1) % premiumSectionFrequency === 0) {
                acc.push(
                  <div key={`premium-${index}`} className="col-span-full">
                    <PremiumAccessButton withContainer={false} />
                  </div>
                );
              }

              return acc;
            }, [] as JSX.Element[])}
          </div>
        ) : (
          renderEmptyState()
        )}

        {searchQuery && products.length > 0 && (
          <div className="text-center my-12">
            <div className="p-8 border rounded-lg shadow-lg bg-card text-card-foreground animate-fade-in">
              <h3 className="text-2xl font-bold mb-4">Vous n'avez pas trouvé votre bonheur ?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                La recherche actuelle ne concerne que nos produits standards. Explorez notre collection exclusive de produits premium pour des articles encore plus exceptionnels.
              </p>
              <PremiumAccessButton />
            </div>
          </div>
        )}

        {(categoryQuery || subcategoryQuery) && (
          <BackToProductsBanner />
        )}
      </main>
    </div>
  );
};

export default Products;