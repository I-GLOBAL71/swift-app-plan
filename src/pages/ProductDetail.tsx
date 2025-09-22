import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";
import { ArrowLeft, ShoppingCart, Heart, Share2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string[] | null;
  is_premium: boolean;
  keywords: string[];
  synonyms: string[];
  is_active: boolean;
  created_at: string;
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setProduct(data as Product);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Produit non trouvé");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Partage annulé");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.image_url) ? product.image_url : 
                 (product.image_url ? [product.image_url as string] : []);

  return (
    <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
            Accueil
          </button>
          <span>/</span>
          <span>Produits</span>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images du produit */}
          <div className="space-y-4">
            <ProductImageCarousel 
              images={images} 
              productName={product.title}
              className="aspect-square"
            />
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                {product.is_premium && (
                  <Badge className="bg-gradient-premium text-premium-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(4.8/5 - 124 avis)</span>
                </div>
              </div>

              <p className="text-4xl font-bold text-primary mb-4">
                {product.price.toLocaleString()} FCFA
              </p>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Mots-clés */}
            {product.keywords && product.keywords.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Caractéristiques</h3>
                <div className="flex flex-wrap gap-2">
                  {product.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité et actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Quantité:</label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Informations de livraison */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Informations de livraison</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Livraison standard:</span>
                    <span className="font-medium">2-5 jours ouvrés</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison express:</span>
                    <span className="font-medium">24-48h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de port:</span>
                    <span className="font-medium text-green-600">Gratuit dès 50 000 FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garantie */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Garanties</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Retour gratuit sous 30 jours</li>
                  <li>✓ Paiement sécurisé</li>
                  <li>✓ Garantie qualité</li>
                  <li>✓ Service client 7j/7</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section produits similaires */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder pour les produits similaires */}
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="bg-muted rounded-lg h-32 mb-3"></div>
                  <h3 className="font-medium mb-2">Produit similaire {item}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Description courte du produit</p>
                  <p className="font-bold text-primary">25 000 FCFA</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </main>
  );
}

export default ProductDetail;