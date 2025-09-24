import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Sparkles, Save, RefreshCw, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ScrapedProduct {
  title: string;
  description: string;
  images: string[];
  price: string;
  variants?: any[];
  keywords?: string;
  synonyms?: string;
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  premiumPrice?: number;
  isPremium: boolean;
  variants: string[];
  selectedImages: string[];
  keywords?: string;
  synonyms?: string;
}

interface ProductImage {
  url: string;
  selected: boolean;
}

interface RewrittenContent {
  title?: string;
  description?: string;
  keywords?: string;
  synonyms?: string;
}

export function AlibabaImporter() {
  const { globalPrice } = useSettings();
  const [url, setUrl] = useState("");
  const [scrapedProduct, setScrapedProduct] = useState<ScrapedProduct | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [rewrittenContent, setRewrittenContent] = useState<RewrittenContent>({});
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: globalPrice,
    isPremium: false,
    variants: [],
    selectedImages: []
  });

  const handleScrape = async () => {
    if (!url.includes('alibaba.com')) {
      toast.error("Veuillez entrer un lien Alibaba.com valide");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-alibaba', {
        body: { action: 'scrape', url }
      });

      if (error) throw error;

      if (data.success) {
        setScrapedProduct(data.product);
        setProductImages(data.product.images.map((img: string) => ({ url: img, selected: true })));
        toast.success("Produit importé avec succès");
      } else {
        throw new Error(data.error || "Erreur lors de l'importation");
      }
    } catch (error) {
      console.error("Error scraping:", error);
      toast.error("Erreur lors de l'importation du produit");
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async (type: 'title' | 'description' | 'keywords' | 'synonyms') => {
    if (!scrapedProduct) return;

    const content = type === 'title' ? scrapedProduct.title :
                   type === 'description' ? scrapedProduct.description :
                   (type === 'keywords' || type === 'synonyms') ? `${scrapedProduct.title}\n${scrapedProduct.description}` :
                   '';

    setRewriting(type);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-alibaba', {
        body: { 
          action: 'rewrite', 
          rewriteData: { content, type }
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (data?.success) {
        const rewrittenText = data.content?.trim();
        if (rewrittenText) {
          setRewrittenContent(prev => ({
            ...prev,
            [type]: rewrittenText
          }));
          toast.success(`${type} réécrit avec succès`);
        } else {
          console.error("Rewrite successful but content is empty.");
          toast.error("La réécriture a échoué: Le contenu généré est vide.");
        }
      } else {
        throw new Error(data?.error || "Erreur lors de la réécriture");
      }
    } catch (error) {
      console.error("Error rewriting:", error);
      toast.error(`Erreur lors de la réécriture: ${error.message}`);
    } finally {
      setRewriting(null);
    }
  };

  const handlePrepareProductForm = () => {
    if (!scrapedProduct) return;

    const selectedImages = productImages.filter(img => img.selected).map(img => img.url);
    const priceMatch = scrapedProduct.price.match(/[\d,]+/);
    const estimatedPrice = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) * 500 : globalPrice;

    setProductFormData({
      title: rewrittenContent.title || scrapedProduct.title,
      description: rewrittenContent.description || scrapedProduct.description,
      price: estimatedPrice,
      isPremium: false,
      variants: scrapedProduct.variants?.map(v => JSON.stringify(v)) || [],
      selectedImages,
      keywords: rewrittenContent.keywords || scrapedProduct.keywords || "",
      synonyms: rewrittenContent.synonyms || scrapedProduct.synonyms || ""
    });
    setShowProductForm(true);
  };

  const handlePublish = async () => {
    if (!productFormData.selectedImages.length) {
      toast.error("Veuillez sélectionner au moins une image");
      return;
    }

    try {
      // Générer un slug à partir du titre
      const slug = productFormData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
        .trim()
        .replace(/\s+/g, '-') // Remplacer espaces par tirets
        .replace(/-+/g, '-') // Éviter les tirets multiples
        .substring(0, 100); // Limiter la longueur

      const productData = {
        title: productFormData.title,
        description: productFormData.description,
        price: productFormData.isPremium ? (productFormData.premiumPrice || productFormData.price) : productFormData.price,
        image_url: productFormData.selectedImages,
        keywords: productFormData.keywords ? productFormData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        synonyms: productFormData.synonyms ? productFormData.synonyms.split(',').map(s => s.trim()).filter(Boolean) : [],
        is_active: true,
        is_premium: productFormData.isPremium,
        slug: slug,
        similar_products_type: 'manual' as const
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast.success("Produit publié avec succès");
      setScrapedProduct(null);
      setProductImages([]);
      setRewrittenContent({});
      setProductFormData({
        title: "",
        description: "",
        price: globalPrice,
        isPremium: false,
        variants: [],
        selectedImages: []
      });
      setUrl("");
      setShowProductForm(false);
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Erreur lors de la publication");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importateur Alibaba</CardTitle>
          <CardDescription>
            Importez et réécrivez automatiquement les données produits depuis Alibaba.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="alibaba-url">Lien du produit Alibaba</Label>
              <Input
                id="alibaba-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.alibaba.com/product-detail/..."
              />
            </div>
            <Button 
              onClick={handleScrape} 
              disabled={loading || !url}
              className="mt-6"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Importer
            </Button>
          </div>
        </CardContent>
      </Card>

      {scrapedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Produit Importé</CardTitle>
            <CardDescription>
              Réécrivez le contenu avec l'IA avant de publier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images */}
            {productImages.length > 0 && (
              <div>
                <Label>Images ({productImages.filter(img => img.selected).length} sélectionnées)</Label>
                <div className="grid grid-cols-4 gap-3 mt-2 max-h-80 overflow-y-auto">
                  {productImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Image ${index + 1}`}
                        className={`w-full h-20 object-cover rounded border-2 cursor-pointer transition-all ${
                          img.selected 
                            ? 'border-primary shadow-md' 
                            : 'border-gray-200 opacity-50'
                        }`}
                        onClick={() => {
                          setProductImages(prev => 
                            prev.map((image, i) => 
                              i === index ? { ...image, selected: !image.selected } : image
                            )
                          );
                        }}
                      />
                      <div className="absolute top-1 right-1">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          img.selected 
                            ? 'bg-primary border-primary' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {img.selected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Cliquez sur les images pour les sélectionner/désélectionner
                </p>
              </div>
            )}

            {/* Titre */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Titre</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewrite('title')}
                  disabled={rewriting === 'title'}
                >
                  {rewriting === 'title' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Réécrire
                </Button>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={scrapedProduct.title}
                  readOnly
                  className="text-sm text-muted-foreground"
                  rows={2}
                />
                {rewrittenContent.title && (
                  <div>
                    <Badge variant="secondary" className="mb-2">Réécrit par IA</Badge>
                    <Textarea
                      value={rewrittenContent.title}
                      onChange={(e) => setRewrittenContent(prev => ({ ...prev, title: e.target.value }))}
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewrite('description')}
                  disabled={rewriting === 'description'}
                >
                  {rewriting === 'description' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Réécrire
                </Button>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={scrapedProduct.description}
                  readOnly
                  className="text-sm text-muted-foreground"
                  rows={3}
                />
                {rewrittenContent.description && (
                  <div>
                    <Badge variant="secondary" className="mb-2">Réécrit par IA</Badge>
                    <Textarea
                      value={rewrittenContent.description}
                      onChange={(e) => setRewrittenContent(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Mots-clés */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mots-clés</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewrite('keywords')}
                  disabled={rewriting === 'keywords'}
                >
                  {rewriting === 'keywords' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Générer
                </Button>
              </div>
              {rewrittenContent.keywords && (
                <div>
                  <Badge variant="secondary" className="mb-2">Générés par IA</Badge>
                  <Textarea
                    value={rewrittenContent.keywords}
                    onChange={(e) => setRewrittenContent(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="mot1, mot2, mot3..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Synonymes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Synonymes</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewrite('synonyms')}
                  disabled={rewriting === 'synonyms'}
                >
                  {rewriting === 'synonyms' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Générer
                </Button>
              </div>
              {rewrittenContent.synonyms && (
                <div>
                  <Badge variant="secondary" className="mb-2">Générés par IA</Badge>
                  <Textarea
                    value={rewrittenContent.synonyms}
                    onChange={(e) => setRewrittenContent(prev => ({ ...prev, synonyms: e.target.value }))}
                    placeholder="synonyme1, synonyme2, synonyme3..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button onClick={handlePrepareProductForm} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Configurer et Publier le Produit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire de configuration du produit */}
      {showProductForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Configuration du Produit</CardTitle>
                <CardDescription>
                  Configurez les détails finaux avant la publication
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowProductForm(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Titre du produit</Label>
                  <Input
                    value={productFormData.title}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={productFormData.description}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Prix de base (FCFA)</Label>
                  <Input
                    type="number"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={productFormData.isPremium}
                    onCheckedChange={(checked) => setProductFormData(prev => ({ ...prev, isPremium: checked }))}
                  />
                  <Label>Produit Premium</Label>
                </div>

                {productFormData.isPremium && (
                  <div>
                    <Label>Prix Premium (FCFA)</Label>
                    <Input
                      type="number"
                      value={productFormData.premiumPrice || ''}
                      onChange={(e) => setProductFormData(prev => ({ 
                        ...prev, 
                        premiumPrice: parseInt(e.target.value) || undefined 
                      }))}
                      placeholder="Prix pour la version premium"
                    />
                  </div>
                )}

                <div>
                  <Label>Variables/Variants (une par ligne)</Label>
                  <Textarea
                    value={productFormData.variants.join('\n')}
                    onChange={(e) => setProductFormData(prev => ({ 
                      ...prev, 
                      variants: e.target.value.split('\n').filter(v => v.trim()) 
                    }))}
                    placeholder="Couleur: Rouge, Bleu, Vert&#10;Taille: S, M, L, XL&#10;Matériau: Coton, Polyester"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Mots-clés (séparés par des virgules)</Label>
                  <Input
                    value={productFormData.keywords || ''}
                    onChange={(e) => setProductFormData(prev => ({ 
                      ...prev, 
                      keywords: e.target.value 
                    }))}
                    placeholder="mode, élégant, qualité"
                  />
                </div>

                <div>
                  <Label>Synonymes (séparés par des virgules)</Label>
                  <Input
                    value={productFormData.synonyms || ''}
                    onChange={(e) => setProductFormData(prev => ({ 
                      ...prev, 
                      synonyms: e.target.value 
                    }))}
                    placeholder="vêtement, habit, tenue"
                  />
                </div>

                <div>
                  <Label>Images sélectionnées ({productFormData.selectedImages.length})</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {productFormData.selectedImages.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Sélectionnée ${index + 1}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handlePublish} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Publier le Produit Final
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}