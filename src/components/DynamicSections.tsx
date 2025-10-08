import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Crown, Package, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/lib/types";
import { useSettings } from "@/contexts/SettingsContext";
import PremiumAccessButton from "@/components/PremiumAccessButton";

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
  selection_mode: 'automatic' | 'manual' | 'mixed';
  mobile_product_columns: number;
}


const DynamicSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [productsBySection, setProductsBySection] = useState<Record<string, Product[]>>({} as Record<string, Product[]>);
  const [loading, setLoading] = useState(true);
  const { productGridColumns, premiumSectionFrequency } = useSettings();

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      try {
        const [sectionsResult, productsResult] = await Promise.all([
          supabase.from("sections").select("*").eq("is_active", true).order("position", { ascending: true }) as any,
          supabase.from("products").select("*").eq("is_active", true) as any
        ]) as any;

        if (sectionsResult.error) throw sectionsResult.error;
        if (productsResult.error) throw productsResult.error;

        const sectionsData: Section[] = (sectionsResult.data || []).map((section: any) => ({
          ...section,
          selection_mode: section.selection_mode || 'automatic'
        }));
        
        const allProducts: Product[] = productsResult.data || [];
        const newProductsBySection: Record<string, Product[]> = {};
        let usedProductIds = new Set<string>();

        for (const section of sectionsData) {
          let sectionProducts: Product[] = [];
          
          if (section.selection_mode === 'manual') {
            // Manual selection logic to be implemented
          } else { // 'automatic' or 'mixed'
            let availableProducts = allProducts.filter(p => !usedProductIds.has(p.id));

            if (section.show_premium_only) {
              sectionProducts = availableProducts.filter(p => p.is_premium);
            } else if (section.show_standard_only) {
              sectionProducts = availableProducts.filter(p => !p.is_premium);
            } else {
              sectionProducts = availableProducts;
            }
            
            sectionProducts = sectionProducts.slice(0, section.max_products);
          }

          newProductsBySection[section.id] = sectionProducts;
          sectionProducts.forEach(p => usedProductIds.add(p.id));
        }

        setSections(sectionsData);
        setProductsBySection(newProductsBySection);

      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erreur lors du chargement des sections");
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

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

  const renderSection = (section: Section) => {
    const filteredProducts = productsBySection[section.id] || [];
    const Icon = getSectionIcon(section.style_type);
    const backgroundClass = getSectionBackgroundClass(section.background_color);
    const gridColsClass = getGridColsClass(productGridColumns, section.mobile_product_columns);
    
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

        <ProductGrid products={filteredProducts} mobileProductColumns={section.mobile_product_columns} />

        <div className="text-center mt-12">
          <Button
            asChild
            variant={section.style_type === "premium" ? "premium" : "outline"}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link to={section.show_premium_only ? "/premium-products" : "/products"}>
              {section.show_premium_only
                ? "Explorer la collection Premium"
                : section.show_standard_only
                ? "Voir tous les produits standards"
                : "Voir plus de produits"}
            </Link>
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

  const allProducts = Object.values(productsBySection).flat();
  const standardProducts = allProducts.filter(p => !p.is_premium);
  const shouldShowPremiumButton = standardProducts.length >= premiumSectionFrequency;

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {sections.map((section, index) => {
        const rendered = renderSection(section);
        if (!rendered) return null;

        const showPremiumAfterSection = shouldShowPremiumButton &&
          premiumSectionFrequency > 0 &&
          (index + 1) % premiumSectionFrequency === 0 &&
          index < sections.length - 1;

        return (
          <div key={section.id}>
            {rendered}
            {showPremiumAfterSection && <PremiumAccessButton withContainer={false} />}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicSections;