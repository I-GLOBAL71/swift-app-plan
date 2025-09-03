import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: {
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
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const images = Array.isArray(product.image_url) ? product.image_url : [product.image_url].filter(Boolean);

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={handleProductClick}>
      <CardContent className="p-4">
        <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
          <ProductImageCarousel 
            images={images} 
            productName={product.title}
            className="h-full"
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
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-primary">
              {product.price.toLocaleString()} FCFA
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;