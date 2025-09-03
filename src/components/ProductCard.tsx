import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import productSample from "@/assets/product-sample.jpg";

interface ProductCardProps {
  title: string;
  image?: string | string[];
  isPremium?: boolean;
  price?: number;
}

const ProductCard = ({ 
  title, 
  image = productSample, 
  isPremium = false, 
  price = 3000 
}: ProductCardProps) => {
  const displayImage = Array.isArray(image) ? image[0] : image || productSample;
  
  return (
    <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-sm">
      <div className="relative overflow-hidden">
        <img 
          src={displayImage} 
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isPremium && (
          <div className="absolute top-3 left-3 bg-gradient-premium text-premium-foreground px-3 py-1 rounded-full text-sm font-semibold">
            Premium
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-3 right-3 bg-background/80 hover:bg-background"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-3 line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-primary">
            {price.toLocaleString()} FCFA
          </div>
          {!isPremium && (
            <div className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
              Prix unique
            </div>
          )}
        </div>
        
        <Button 
          variant={isPremium ? "premium" : "default"} 
          className="w-full group"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2 group-hover:animate-bounce" />
          Ajouter au panier
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;