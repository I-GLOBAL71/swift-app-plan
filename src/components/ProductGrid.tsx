import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Crown, Package } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import type { Product } from "@/lib/types";

const ProductGrid = () => {
  const { globalPrice, productGridColumns } = useSettings();

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 lg:grid-cols-4';
      case 5:
        return 'grid-cols-2 lg:grid-cols-5';
      default:
        return 'grid-cols-2 md:grid-cols-3';
    }
  };

  const gridColsClass = getGridColsClass(productGridColumns);

  const standardProducts: Product[] = [
    {
      id: "1",
      title: "Sac à main artisanal en cuir",
      description: "Magnifique sac en cuir artisanal",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "sac-a-main-artisanal-en-cuir",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "2",
      title: "Collier traditionnel en perles",
      description: "Collier traditionnel fait à la main",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "collier-traditionnel-en-perles",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "3",
      title: "Bracelet en bois sculpté",
      description: "Bracelet artisanal en bois sculpté",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "bracelet-en-bois-sculpte",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "4",
      title: "Écharpe en tissu africain",
      description: "Écharpe colorée en tissu traditionnel",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "echarpe-en-tissu-africain",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "5",
      title: "Boucles d'oreilles en bronze",
      description: "Élégantes boucles d'oreilles en bronze",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "boucles-oreilles-en-bronze",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "6",
      title: "Porte-monnaie en raphia",
      description: "Petit porte-monnaie en raphia tressé",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "porte-monnaie-en-raphia",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "7",
      title: "Chaussures en cuir naturel",
      description: "Chaussures confortables en cuir",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "chaussures-en-cuir-naturel",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "8",
      title: "Ceinture artisanale",
      description: "Belle ceinture faite à la main",
      price: globalPrice,
      image_url: null,
      is_premium: false,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "ceinture-artisanale",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
  ];

  const premiumProducts: Product[] = [
    {
      id: "p1",
      title: "Robe de soirée brodée à la main",
      description: "Magnifique robe de soirée avec broderie artisanale",
      price: 15000,
      image_url: null,
      is_premium: true,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "robe-de-soiree-brodee-a-la-main",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "p2",
      title: "Sculpture en bois précieux",
      description: "Sculpture artisanale en bois précieux",
      price: 25000,
      image_url: null,
      is_premium: true,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "sculpture-en-bois-precieux",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
    {
      id: "p3",
      title: "Bijou en or artisanal",
      description: "Bijou unique en or fait main",
      price: 45000,
      image_url: null,
      is_premium: true,
      keywords: [],
      synonyms: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_products_type: "auto" as const,
      slug: "bijou-en-or-artisanal",
      fts: null,
      category_id: null,
      sub_category_id: null
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Standard Products Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8 text-primary" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Nos Produits
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre sélection de produits de qualité, tous au même prix accessible de {globalPrice.toLocaleString()} FCFA
          </p>
        </div>
        
        <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
          {standardProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Voir tous les produits
          </Button>
        </div>
      </div>

      {/* Premium Section */}
      <div className="bg-gradient-to-r from-secondary/50 to-accent/20 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-premium" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Collection Premium
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Des pièces d'exception pour les occasions spéciales
          </p>
        </div>
        
        <div className={`grid ${gridColsClass} gap-4 sm:gap-6 mb-8`}>
          {premiumProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="premium" size="lg" className="w-full sm:w-auto">
            Explorer la collection Premium
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;