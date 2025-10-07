import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, ArrowRight, Star, Heart, Shield } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/lib/types";


interface StandardSectionProps {
  products: Product[];
  loading: boolean;
  mobileProductColumns?: number;
}

const StandardSection = ({ products: standardProducts, loading, mobileProductColumns }: StandardSectionProps) => {

  if (loading) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="text-lg">Chargement des produits...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ShoppingBag className="w-10 h-10 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Nos Produits à Prix Unique
            </h2>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Découvrez notre sélection de produits de qualité, tous proposés au même prix accessible de{" "}
            <span className="font-bold text-primary text-2xl">3,000 FCFA</span>.
            Une expérience d'achat simplifiée pour tous.
          </p>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card/80 border border-primary/20 shadow-card">
              <Star className="w-6 h-6 text-primary" />
              <span className="font-medium text-foreground">Qualité Garantie</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card/80 border border-primary/20 shadow-card">
              <Heart className="w-6 h-6 text-primary" />
              <span className="font-medium text-foreground">Prix Équitable</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card/80 border border-primary/20 shadow-card">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-medium text-foreground">Artisanat Local</span>
            </div>
          </div>
        </div>

        {/* Price Highlight */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 bg-gradient-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-soft">
            <Package className="w-8 h-8" />
            <div>
              <div className="text-3xl font-bold">3,000 FCFA</div>
              <div className="text-sm opacity-90">Prix unique pour tous les produits</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {standardProducts.length > 0 ? (
          <>
            <ProductGrid products={standardProducts} mobileProductColumns={mobileProductColumns} />

            {/* CTA Section */}
            <div className="text-center bg-card/50 rounded-2xl p-8 border border-primary/20 mt-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Des milliers de produits vous attendent !
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Explorez notre catalogue complet et trouvez le produit parfait au prix qui vous convient.
              </p>
              <Button asChild variant="outline" size="lg" className="group w-full sm:w-auto">
                <Link to="/products">
                  <Package className="w-5 h-5 mr-2" />
                  Voir Tous les Produits
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Produits en cours d'ajout</h3>
            <p className="text-muted-foreground">
              Notre sélection de produits sera bientôt disponible.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StandardSection;