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

interface ProductCardProps {
  product: Tables<"products">;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [justSwiped, setJustSwiped] = useState(false);
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const images: string[] = (Array.isArray(product.image_url)
    ? product.image_url.filter((i): i is string => typeof i === 'string')
    : (typeof product.image_url === 'string' ? [product.image_url] : [])
  );

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
        image_url: images.length > 0 ? images : null,
        is_premium: product.is_premium || false,
    };

    addToCart(productForCart, 1);
    toast({
      title: "Produit ajouté !",
      description: `${product.title} a été ajouté au panier`,
    });
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={handleProductClick}>
      <CardContent className="p-4">
        <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
          <ProductImageCarousel 
            images={images}
            productName={product.title}
            className="h-full"
            onSwipe={handleSwipe}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">{product.title}</h3>
            {product.is_premium && (
              <Badge className="ml-2 bg-gradient-premium text-premium-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description || ""}
          </p>
          
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xl font-bold text-primary">
              {product.price.toLocaleString()} FCFA
            </div>
            <div className="flex items-center gap-2">
              <ShareButton product={{ id: product.id, title: product.title, slug: product.slug }} />
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="flex items-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;