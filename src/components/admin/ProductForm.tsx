import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_premium: boolean;
  keywords: string[];
  synonyms: string[];
  is_active: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || 3000,
    image_url: product?.image_url || "",
    is_premium: product?.is_premium || false,
    keywords: product?.keywords || [],
    synonyms: product?.synonyms || [],
    is_active: product?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product?.id) {
        // Mise à jour
        const { error } = await supabase
          .from("products")
          .update(formData)
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Produit mis à jour avec succès");
      } else {
        // Création
        const { error } = await supabase.from("products").insert([formData]);
        if (error) throw error;
        toast.success("Produit créé avec succès");
      }
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const enhanceWithAI = async () => {
    if (!formData.title.trim()) {
      toast.error("Veuillez saisir un titre avant d'utiliser l'IA");
      return;
    }

    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-product", {
        body: {
          title: formData.title,
          description: formData.description,
        },
      });

      if (error) throw error;

      setFormData({
        ...formData,
        description: data.description,
        keywords: data.keywords,
        synonyms: data.synonyms,
      });

      toast.success("Contenu amélioré avec l'IA!");
    } catch (error) {
      console.error("Erreur lors de l'amélioration avec l'IA:", error);
      toast.error("Erreur lors de l'amélioration avec l'IA");
    } finally {
      setEnhancing(false);
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(",").map((k) => k.trim()).filter(Boolean);
    setFormData({ ...formData, keywords });
  };

  const handleSynonymsChange = (value: string) => {
    const synonyms = value.split(",").map((s) => s.trim()).filter(Boolean);
    setFormData({ ...formData, synonyms });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {product ? "Modifier le Produit" : "Nouveau Produit"}
          {formData.is_premium && (
            <Sparkles className="h-5 w-5 text-premium" />
          )}
        </CardTitle>
        <CardDescription>
          Remplissez les informations du produit. Utilisez l'IA pour améliorer automatiquement le contenu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={enhanceWithAI}
                    disabled={enhancing}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {enhancing ? "Amélioration..." : "Améliorer avec IA"}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Prix (FCFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                />
                <Label htmlFor="is_premium">Produit Premium</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Produit Actif</Label>
              </div>

              <div>
                <Label htmlFor="keywords">Mots-clés (séparés par des virgules)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords.join(", ")}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder="mode, élégant, qualité"
                />
              </div>

              <div>
                <Label htmlFor="synonyms">Synonymes (séparés par des virgules)</Label>
                <Input
                  id="synonyms"
                  value={formData.synonyms.join(", ")}
                  onChange={(e) => handleSynonymsChange(e.target.value)}
                  placeholder="vêtement, habit, tenue"
                />
              </div>
            </div>
          </div>

          {formData.image_url && (
            <div>
              <Label>Aperçu de l'image</Label>
              <img
                src={Array.isArray(formData.image_url) ? formData.image_url[0] : formData.image_url}
                alt="Aperçu"
                className="w-32 h-32 object-cover rounded mt-2"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}