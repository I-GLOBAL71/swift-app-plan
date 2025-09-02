import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Sparkles, Save, RefreshCw } from "lucide-react";

interface ScrapedProduct {
  title: string;
  description: string;
  images: string[];
  price: string;
  variants?: any[];
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
  const [url, setUrl] = useState("");
  const [scrapedProduct, setScrapedProduct] = useState<ScrapedProduct | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [rewrittenContent, setRewrittenContent] = useState<RewrittenContent>({});
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);

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
                   type === 'keywords' ? scrapedProduct.title :
                   scrapedProduct.title;

    setRewriting(type);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-alibaba', {
        body: { 
          action: 'rewrite', 
          rewriteData: { content, type }
        }
      });

      if (error) throw error;

      if (data.success) {
        setRewrittenContent(prev => ({
          ...prev,
          [type]: data.content
        }));
        toast.success(`${type} réécrit avec succès`);
      } else {
        throw new Error(data.error || "Erreur lors de la réécriture");
      }
    } catch (error) {
      console.error("Error rewriting:", error);
      toast.error("Erreur lors de la réécriture");
    } finally {
      setRewriting(null);
    }
  };

  const handlePublish = async () => {
    if (!scrapedProduct) return;

    try {
      // Convertir le prix en nombre (extraction basique)
      const priceMatch = scrapedProduct.price.match(/[\d,]+/);
      const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) * 500 : 3000; // Estimation FCFA

      const selectedImages = productImages.filter(img => img.selected);
      const productData = {
        title: rewrittenContent.title || scrapedProduct.title,
        description: rewrittenContent.description || scrapedProduct.description,
        price,
        image_url: selectedImages[0]?.url || null,
        keywords: rewrittenContent.keywords ? rewrittenContent.keywords.split(',').map(k => k.trim()) : [],
        synonyms: rewrittenContent.synonyms ? rewrittenContent.synonyms.split(',').map(s => s.trim()) : [],
        is_active: true,
        is_premium: false
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast.success("Produit publié avec succès");
      setScrapedProduct(null);
      setProductImages([]);
      setRewrittenContent({});
      setUrl("");
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
              <Button onClick={handlePublish} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Publier le Produit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}