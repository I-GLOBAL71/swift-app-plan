import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Crown, Package } from "lucide-react";

const ProductGrid = () => {
  const standardProducts = [
    { title: "Sac à main artisanal en cuir" },
    { title: "Collier traditionnel en perles" },
    { title: "Bracelet en bois sculpté" },
    { title: "Écharpe en tissu africain" },
    { title: "Boucles d'oreilles en bronze" },
    { title: "Porte-monnaie en raphia" },
    { title: "Chaussures en cuir naturel" },
    { title: "Ceinture artisanale" },
  ];

  const premiumProducts = [
    { title: "Robe de soirée brodée à la main", price: 15000, isPremium: true },
    { title: "Sculpture en bois précieux", price: 25000, isPremium: true },
    { title: "Bijou en or artisanal", price: 45000, isPremium: true },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Standard Products Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nos Produits
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre sélection de produits de qualité, tous au même prix accessible de 3000 FCFA
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {standardProducts.map((product, index) => (
            <ProductCard
              key={index}
              title={product.title}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Voir tous les produits
          </Button>
        </div>
      </div>

      {/* Premium Section */}
      <div className="bg-gradient-to-r from-secondary/50 to-accent/20 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-premium" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Collection Premium
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des pièces d'exception pour les occasions spéciales
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {premiumProducts.map((product, index) => (
            <ProductCard
              key={index}
              title={product.title}
              price={product.price}
              isPremium={product.isPremium}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="premium" size="lg">
            Explorer la collection Premium
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;