import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Tables } from '../integrations/supabase/types';
import { Skeleton } from './ui/skeleton';
import { useSettings } from '@/contexts/SettingsContext';
import ProductCard from './ProductCard';

type HeroProduct = Tables<'products'>;

const HeroProductGrid = () => {
  const { heroGridRows, heroGridCols, heroGridAlternatesPremiumProducts } = useSettings();
  const [allProducts, setAllProducts] = useState<HeroProduct[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<HeroProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gridCount = heroGridRows * heroGridCols;

  useEffect(() => {
    const fetchHeroProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let finalProducts: HeroProduct[] = [];

        if (heroGridAlternatesPremiumProducts) {
          const [standardProductsRes, premiumProductsRes] = await Promise.all([
            supabase.from('products').select('*').eq('is_premium', false).not('image_url', 'is', null).limit(25),
            supabase.from('products').select('*').eq('is_premium', true).not('image_url', 'is', null).limit(25)
          ]);

          if (standardProductsRes.error) throw standardProductsRes.error;
          if (premiumProductsRes.error) throw premiumProductsRes.error;

          const standardProducts = standardProductsRes.data.sort(() => 0.5 - Math.random());
          const premiumProducts = premiumProductsRes.data.sort(() => 0.5 - Math.random());
          
          let i = 0, j = 0;
          while (i < standardProducts.length && j < premiumProducts.length) {
            finalProducts.push(standardProducts[i++]);
            finalProducts.push(premiumProducts[j++]);
          }
          finalProducts = finalProducts.concat(standardProducts.slice(i)).concat(premiumProducts.slice(j));

        } else {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_premium', false)
            .not('image_url', 'is', null)
            .limit(50);
          
          if (error) throw error;
          finalProducts = data.sort(() => 0.5 - Math.random());
        }
        
        setAllProducts(finalProducts);
        setVisibleProducts(finalProducts.slice(0, gridCount));

      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching hero products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroProducts();
  }, [gridCount, heroGridAlternatesPremiumProducts]);

  useEffect(() => {
    const timer = 3000; // This will be configurable from the admin panel
    if (allProducts.length > gridCount) {
      const interval = setInterval(() => {
        setVisibleProducts(currentVisible => {
          const newVisible = [...currentVisible];
          
          const availableProducts = allProducts.filter(
            p => !newVisible.some(vp => vp.id === p.id)
          );

          if (availableProducts.length > 0) {
            const productToReplaceIndex = Math.floor(Math.random() * newVisible.length);
            const newProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
            newVisible[productToReplaceIndex] = newProduct;
          }
          return newVisible;
        });
      }, timer);
      return () => clearInterval(interval);
    }
  }, [allProducts, gridCount]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`grid grid-cols-2 md:grid-cols-${heroGridCols} gap-2 md:gap-4`}>
          {Array.from({ length: gridCount }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 py-6 sm:py-8">
        <div className="container mx-auto px-4">
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${heroGridCols} lg:grid-cols-${heroGridCols} gap-2 md:gap-4`}>
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="hero" />
                ))}
            </div>
        </div>
    </div>
  );
};

export default HeroProductGrid;