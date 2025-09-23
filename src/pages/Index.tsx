import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeroCarousel from "@/components/HeroCarousel";
import StandardSection from "@/components/StandardSection";
import PremiumAccessButton from "@/components/PremiumAccessButton";
import DynamicSections from "@/components/DynamicSections";
import { useSettings } from "@/contexts/SettingsContext";
import { Product } from "@/lib/types";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { premiumSectionFrequency } = useSettings();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_premium", false)
          .eq("is_active", true)
          .limit(8);

        if (error) throw error;
        setProducts(data as Product[]);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const showPremiumButton = products.length >= premiumSectionFrequency;

  return (
    <main className="flex flex-col items-center">
      <HeroCarousel />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-12 md:space-y-16">
          <section id="products">
            <StandardSection products={products} loading={loading} />
          </section>
          {showPremiumButton && <PremiumAccessButton />}
          <DynamicSections />
        </div>
      </div>
    </main>
  );
};

export default Index;
