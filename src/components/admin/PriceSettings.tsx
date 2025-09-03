import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, DollarSign } from "lucide-react";

export function PriceSettings() {
  const [globalPrice, setGlobalPrice] = useState<number>(3000);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGlobalPrice();
  }, []);

  const loadGlobalPrice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "global_product_price")
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data?.value) {
        setGlobalPrice(parseInt(data.value));
      }
    } catch (error) {
      console.error("Error loading global price:", error);
      toast.error("Erreur lors du chargement du prix global");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sauvegarder le prix global dans les paramètres
      const { error: settingsError } = await supabase
        .from("settings")
        .upsert({
          key: "global_product_price",
          value: globalPrice.toString(),
          description: "Prix unique appliqué à tous les produits non-premium"
        });

      if (settingsError) throw settingsError;

      // Mettre à jour tous les produits non-premium
      const { error: updateError } = await supabase
        .from("products")
        .update({ price: globalPrice })
        .eq("is_premium", false);

      if (updateError) throw updateError;

      toast.success("Prix global mis à jour avec succès");
    } catch (error) {
      console.error("Error saving global price:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const applyPriceNow = async () => {
    if (!confirm("Êtes-vous sûr de vouloir appliquer ce prix à tous les produits non-premium ?")) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ price: globalPrice })
        .eq("is_premium", false);

      if (error) throw error;

      toast.success(`Prix ${globalPrice.toLocaleString()} FCFA appliqué à tous les produits non-premium`);
    } catch (error) {
      console.error("Error applying price:", error);
      toast.error("Erreur lors de l'application du prix");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des paramètres de prix...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Paramètres de Prix
        </CardTitle>
        <CardDescription>
          Définissez un prix unique pour tous les produits non-premium de la boutique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="global-price">Prix unique des produits (FCFA)</Label>
            <Input
              id="global-price"
              type="number"
              value={globalPrice}
              onChange={(e) => setGlobalPrice(parseInt(e.target.value) || 0)}
              min="0"
              step="100"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Ce prix sera appliqué uniquement aux produits non-premium
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Aperçu</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Prix qui sera appliqué: <span className="font-bold text-foreground">{globalPrice.toLocaleString()} FCFA</span>
            </p>
            <p className="text-xs text-muted-foreground">
              ⚠️ Cette action n'affectera pas les produits premium qui conservent leurs prix individuels
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={applyPriceNow}
              disabled={saving}
            >
              Appliquer maintenant aux produits existants
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}