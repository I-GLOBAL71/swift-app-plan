import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Save } from "lucide-react";

export function ApiSettings() {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [lygosApiKey, setLygosApiKey] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showLygosKey, setShowLygosKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .in("key", ["gemini_api_key", "lygos_api_key"]);

      if (error) throw error;

      if (data) {
        const geminiSetting = data.find(s => s.key === "gemini_api_key");
        const lygosSetting = data.find(s => s.key === "lygos_api_key");
        setGeminiApiKey(geminiSetting?.value || "");
        setLygosApiKey(lygosSetting?.value || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        {
          key: "gemini_api_key",
          value: geminiApiKey,
          description: "Clé API Google Gemini pour l'IA générative"
        },
        {
          key: "lygos_api_key", 
          value: lygosApiKey,
          description: "Clé API Lygos App pour les paiements"
        }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("settings")
          .upsert(setting, { onConflict: 'key' });
        if (error) throw error;
      }

      toast.success("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration API</CardTitle>
          <CardDescription>
            Gérez les clés API et les paramètres de configuration du système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">Clé API Google Gemini</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gemini-api-key"
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Entrez votre clé API Gemini"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Cette clé sera utilisée pour les fonctionnalités d'IA générative.
              Vous pouvez obtenir une clé sur{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lygos-api-key">Clé API Lygos App</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="lygos-api-key"
                  type={showLygosKey ? "text" : "password"}
                  value={lygosApiKey}
                  onChange={(e) => setLygosApiKey(e.target.value)}
                  placeholder="Entrez votre clé API Lygos"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowLygosKey(!showLygosKey)}
                >
                  {showLygosKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Cette clé sera utilisée pour les paiements Lygos App.
              Vous pouvez obtenir une clé sur{" "}
              <a
                href="https://docs.lygosapp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Lygos App Dashboard
              </a>
            </p>
          </div>

          <Button onClick={saveSettings} disabled={saving} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}