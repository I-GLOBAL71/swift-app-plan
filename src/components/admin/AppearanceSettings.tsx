import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Palette } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export function AppearanceSettings() {
  const {
    heroStyle: currentHeroStyle,
    heroGridRows: currentGridRows,
    heroGridCols: currentGridCols,
    heroGridAlternatesPremiumProducts: currentAlternatesPremium,
    productGridColumns: currentProductGridColumns,
    reloadSettings
  } = useSettings();
  
  const [heroStyle, setHeroStyle] = useState<'carousel' | 'product_grid'>(currentHeroStyle);
  const [gridRows, setGridRows] = useState(currentGridRows);
  const [gridCols, setGridCols] = useState(currentGridCols);
  const [alternatesPremium, setAlternatesPremium] = useState(currentAlternatesPremium);
  const [productGridColumns, setProductGridColumns] = useState(currentProductGridColumns);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHeroStyle(currentHeroStyle);
    setGridRows(currentGridRows);
    setGridCols(currentGridCols);
    setAlternatesPremium(currentAlternatesPremium);
  }, [currentHeroStyle, currentGridRows, currentGridCols, currentAlternatesPremium, currentProductGridColumns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const settingsToUpdate = [
      { key: 'hero_style', value: heroStyle },
      { key: 'hero_grid_rows', value: gridRows.toString() },
      { key: 'hero_grid_cols', value: gridCols.toString() },
      { key: 'hero_grid_alternates_premium_products', value: alternatesPremium.toString() },
      { key: 'product_grid_columns', value: productGridColumns.toString() }
    ];

    try {
      const { error } = await supabase.from("settings").upsert(settingsToUpdate, { onConflict: 'key' });

      if (error) throw error;

      toast.success("Paramètres d'apparence sauvegardés avec succès");
      await reloadSettings();
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast.error("Erreur lors de la sauvegarde des paramètres d'apparence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Apparence
        </CardTitle>
        <CardDescription>
          Gérez l'apparence de votre boutique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Nombre de colonnes pour les produits</Label>
            <Input
              id="product-grid-cols"
              type="number"
              value={productGridColumns}
              onChange={(e) => setProductGridColumns(parseInt(e.target.value, 10) || 1)}
              min="1"
              max="5"
            />
            <p className="text-sm text-muted-foreground">
              Définissez le nombre de colonnes pour afficher les produits sur les pages de la boutique.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Style de la section "Héros"</Label>
            <RadioGroup
              value={heroStyle}
              onValueChange={(value: 'carousel' | 'product_grid') => setHeroStyle(value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="carousel" id="carousel" />
                <Label htmlFor="carousel">Carrousel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="product_grid" id="product_grid" />
                <Label htmlFor="product_grid">Grille de produits</Label>
              </div>
            </RadioGroup>
          </div>

          {heroStyle === 'product_grid' && (
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium">Configuration de la grille</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="grid-rows">Lignes</Label>
                        <Input id="grid-rows" type="number" value={gridRows} onChange={(e) => setGridRows(parseInt(e.target.value, 10) || 1)} min="1" />
                    </div>
                    <div>
                        <Label htmlFor="grid-cols">Colonnes</Label>
                        <Input id="grid-cols" type="number" value={gridCols} onChange={(e) => setGridCols(parseInt(e.target.value, 10) || 1)} min="1" />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="alternates-premium">Alterner avec les produits premium</Label>
                    <Switch
                        id="alternates-premium"
                        checked={alternatesPremium}
                        onCheckedChange={setAlternatesPremium}
                    />
                </div>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}