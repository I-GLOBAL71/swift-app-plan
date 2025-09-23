import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Crown, Sparkles, Star, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const PremiumProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadPremiumProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy]);

  const loadPremiumProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_premium", true)
        .eq("is_active", true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading premium products:", error);
      toast.error("Erreur lors du chargement des produits premium");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort products
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredProducts(filtered);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-premium/10 via-transparent to-accent/10"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-premium rounded-full opacity-20 blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-primary rounded-full opacity-15 blur-2xl animate-float"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Crown className="w-16 h-16 text-premium drop-shadow-lg" />
                <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-pulse-soft" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                Nos Gadgets Premium
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Découvrez nos gadgets exceptionnels, une sélection de produits uniques dont les prix dépassent 3,000 FCFA. Profitez des prix les plus compétitifs du marché.
            </p>

            {/* Premium Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-card/50 border border-premium/20 shadow-premium">
                <Star className="w-8 h-8 text-premium" />
                <span className="font-bold text-lg text-foreground">Gadgets Exceptionnels</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-card/50 border border-premium/20 shadow-premium">
                <Crown className="w-8 h-8 text-premium" />
                <span className="font-bold text-lg text-foreground">Prix {'>'} 3,000 FCFA</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-card/50 border border-premium/20 shadow-premium">
                <Sparkles className="w-8 h-8 text-premium" />
                <span className="font-bold text-lg text-foreground">Meilleurs Prix Garantis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un gadget premium..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Trier par:</span>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récents</SelectItem>
                  <SelectItem value="oldest">Plus anciens</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-8">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} premium{filteredProducts.length !== 1 ? 's' : ''}
            {searchTerm && ` trouvé${filteredProducts.length !== 1 ? 's' : ''} pour "${searchTerm}"`}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-lg">Chargement de la collection premium...</div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="transform hover:scale-105 transition-transform duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative">
                    {/* Premium badge overlay */}
                    <div className="absolute top-4 right-4 z-10 bg-gradient-premium text-premium-foreground px-3 py-2 rounded-full text-xs font-bold shadow-premium">
                      <Crown className="w-3 h-3 inline mr-1" />
                      PREMIUM
                    </div>
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Crown className="w-16 h-16 text-premium mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">
                {searchTerm ? "Aucun produit trouvé" : "Collection premium à venir"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? `Aucun produit premium ne correspond à "${searchTerm}"`
                  : "Notre collection de produits premium sera bientôt disponible."
                }
              </p>
              {searchTerm && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="mx-auto"
                  >
                    Effacer la recherche
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PremiumProducts;