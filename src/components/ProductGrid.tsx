import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Crown, Package } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  mobileProductColumns?: number;
}

const ProductGrid = ({ products, mobileProductColumns }: ProductGridProps) => {
  const { productGridColumns } = useSettings();

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

  const gridColsClass = getGridColsClass(productGridColumns, mobileProductColumns);

  return (
    <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;