import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingCart, Share2 } from "lucide-react";
import { ProductImageCarousel } from "./ProductImageCarousel";
import ShareButton from "./ShareButton";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";

import { Tables } from "@/integrations/supabase/types";
import { toImagesArray } from "@/lib/utils";

interface ProductCardProps {
  product: Tables<"products">;
  variant?: 'hero' | 'default';
}

const ProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [justSwiped, setJustSwiped] = useState(false);
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const images: string[] = toImagesArray(product.image_url as unknown);
  
  // Use priority image if defined, otherwise use first image
  const priorityIndex = (product as any).priority_image_index || 0;
  const orderedImages = images.length > 0 ? [
    images[priorityIndex] || images[0],
    ...images.filter((_, index) => index !== priorityIndex)
  ] : images;

  const handleSwipe = () => {
    setJustSwiped(true);
    if (swipeTimeoutRef.current) {
      clearTimeout(swipeTimeoutRef.current);
    }
    swipeTimeoutRef.current = setTimeout(() => {
      setJustSwiped(false);
    }, 200);
  };

  const handleProductClick = () => {
    if (justSwiped) {
      return;
    }
    navigate(`/product/${product.slug}/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la navigation vers la page produit
    
    const productForCart = {
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: orderedImages.length > 0 ? orderedImages : null,
        is_premium: product.is_premium || false,
    };

    addToCart(productForCart, 1);
    toast({
      title: "Produit ajouté !",
      description: `${product.title} a été ajouté au panier`,
    });
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full" onClick={handleProductClick}>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-4 bg-muted">
          <ProductImageCarousel
            images={orderedImages}
            productName={product.title}
            className="h-full"
            onSwipe={handleSwipe}
          />
          {variant === 'hero' && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm text-white">
              <h3 className="font-semibold text-sm truncate">{product.title}</h3>
              <p className="text-xs font-bold text-white/90">{product.price.toLocaleString()} FCFA</p>
            </div>
          )}
        </div>
        
        {variant === 'default' && (
          <div className="pt-4">
            <h3 className="font-semibold text-sm text-foreground truncate">{product.title}</h3>
            <p className="text-xs font-bold text-primary">{product.price.toLocaleString()} FCFA</p>
          </div>
        )}
        <div className="flex-grow" /> {/* This spacer pushes the buttons to the bottom */}
        <div className="flex items-center gap-2 pt-2">
          <ShareButton product={{ id: product.id, title: product.title, slug: product.slug }} size="sm" />
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-4 h-4" />
            Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;