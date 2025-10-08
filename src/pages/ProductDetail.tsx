import { useState, useEffect } from "react";
import { toImagesArray } from "@/lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ArrowLeft, ShoppingCart, Heart, Share2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import BackToProductsBanner from "@/components/BackToProductsBanner";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      const loadedProduct = data as Product;
      setProduct(loadedProduct);
      loadSimilarProducts(loadedProduct);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Produit non trouvé");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarProducts = async (currentProduct: Product) => {
    if (!currentProduct) return;

    try {
      let similar: Product[] = [];
      if (currentProduct.similar_products_type === 'manual') {
        const { data: relations, error: relationsError } = await supabase
          .from('product_relations')
          .select('related_product_id')
          .eq('product_id', currentProduct.id);

        if (relationsError) throw relationsError;

        const similarIds = relations.map(r => r.related_product_id);
        if (similarIds.length > 0) {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*, slug, similar_products_type')
            .in('id', similarIds)
            .eq('is_active', true)
            .limit(4);
          
          if (productsError) throw productsError;
          similar = products as Product[];
        }
      } else { // 'auto' mode
        if (currentProduct.keywords && currentProduct.keywords.length > 0) {
          const { data, error } = await supabase
            .from('products')
            .select('*, slug, similar_products_type')
            .overlaps('keywords', currentProduct.keywords)
            .not('id', 'eq', currentProduct.id)
            .eq('is_active', true)
            .limit(4);

          if (error) throw error;
          similar = data as Product[];
        }
      }
      setSimilarProducts(similar);
    } catch (error) {
      console.error("Error loading similar products:", error);
      // Ne pas afficher de toast pour cette erreur, ce n'est pas critique
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const images: string[] = (Array.isArray(product.image_url)
        ? product.image_url.filter((i): i is string => typeof i === 'string')
        : (typeof product.image_url === 'string' ? [product.image_url] : [])
      );

      const productForCart = {
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: images.length > 0 ? images : null,
        is_premium: product.is_premium || false,
      };
      addToCart(productForCart, quantity);
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

  const images: string[] = toImagesArray(product.image_url as unknown);

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
            <ProductImageGallery
              images={images}
              productName={product.title}
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
          {similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucun produit similaire trouvé pour le moment.</p>
          )}
        </div>

        <BackToProductsBanner />
    </main>
  );
}
export default ProductDetail;