import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string[] | string | null;
  is_premium: boolean;
  keywords: string[];
  synonyms: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PremiumSection = () => {
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPremiumProducts();
  }, []);

  const loadPremiumProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_premium", true)
        .eq("is_active", true)
        .limit(6);

      if (error) throw error;
      setPremiumProducts(data as Product[] || []);
    } catch (error) {
      console.error("Error loading premium products:", error);
      toast.error("Erreur lors du chargement des produits premium");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="text-lg">Chargement de la collection premium...</div>
        </div>
      </div>
    );
  }

  if (premiumProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-premium/5 via-transparent to-accent/10"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-premium rounded-full opacity-20 blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-primary rounded-full opacity-15 blur-2xl animate-float"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Premium Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Crown className="w-12 h-12 text-premium drop-shadow-lg" />
              <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse-soft" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-premium bg-clip-text text-transparent">
              Collection Premium
            </h2>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Découvrez nos pièces d'exception, conçues avec les meilleurs matériaux et un savoir-faire artisanal unique. 
            Chaque produit raconte une histoire d'excellence et d'authenticité.
          </p>

          {/* Premium Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card/50 border border-premium/20">
              <Star className="w-6 h-6 text-premium" />
              <span className="font-medium text-foreground">Qualité Exceptionnelle</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card/50 border border-premium/20">
              <Crown className="w-6 h-6 text-premium" />
              <span className="font-medium text-foreground">Édition Limitée</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card/50 border border-premium/20">
              <Sparkles className="w-6 h-6 text-premium" />
              <span className="font-medium text-foreground">Fait Main</span>
            </div>
          </div>
        </div>

        {/* Premium Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {premiumProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="transform hover:scale-105 transition-transform duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                {/* Premium badge overlay */}
                <div className="absolute top-4 right-4 z-10 bg-gradient-premium text-premium-foreground px-3 py-1 rounded-full text-xs font-bold shadow-premium">
                  <Crown className="w-3 h-3 inline mr-1" />
                  PREMIUM
                </div>
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-premium/10 via-transparent to-accent/10 rounded-3xl p-8 md:p-12 border border-premium/20">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Prêt à découvrir l'excellence ?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explorez notre collection complète de produits premium et trouvez la pièce parfaite qui vous correspond.
          </p>
          <Button variant="premium" size="lg" className="group">
            <Crown className="w-5 h-5 mr-2" />
            Explorer la Collection Premium
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;