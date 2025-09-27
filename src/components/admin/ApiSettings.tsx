import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Save } from "lucide-react";

export function ApiSettings() {
  const [aiProvider, setAiProvider] = useState("gemini");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-pro");
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [claudeModel, setClaudeModel] = useState("claude-3-haiku-20240307");
  const [lygosApiKey, setLygosApiKey] = useState("");
  const [geminiModels, setGeminiModels] = useState<string[]>([]);

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
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
        .in("key", [
            "ai_provider",
            "gemini_api_key",
            "gemini_model",
            "gemini_models",
            "claude_api_key",
            "claude_model",
            "lygos_api_key"
       ]);

     if (error) throw error;

     if (data) {
       const settingsMap = new Map(data.map(s => [s.key, s.value]));
       setAiProvider(settingsMap.get("ai_provider") || "gemini");
       setGeminiApiKey(settingsMap.get("gemini_api_key") || "");
       setGeminiModel(settingsMap.get("gemini_model") || "gemini-1.5-flash-8b");
       const modelsStr = settingsMap.get("gemini_models");
       if (modelsStr) {
           try {
               setGeminiModels(JSON.parse(modelsStr));
           } catch (e) {
               console.error("Failed to parse gemini_models", e);
               setGeminiModels(["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-1.5-flash-8b"]);
           }
       } else {
           setGeminiModels(["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-1.5-flash-8b"]);
       }
       setClaudeApiKey(settingsMap.get("claude_api_key") || "");
       setClaudeModel(settingsMap.get("claude_model") || "claude-3-haiku-20240307");
       setLygosApiKey(settingsMap.get("lygos_api_key") || "");
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
        { key: "ai_provider", value: aiProvider, description: "Fournisseur d'IA à utiliser" },
        { key: "gemini_api_key", value: geminiApiKey, description: "Clé API Google Gemini" },
        { key: "gemini_model", value: geminiModel, description: "Modèle Gemini à utiliser" },
        { key: "claude_api_key", value: claudeApiKey, description: "Clé API Anthropic Claude" },
        { key: "claude_model", value: claudeModel, description: "Modèle Claude à utiliser" },
        { key: "lygos_api_key", value: lygosApiKey, description: "Clé API Lygos App" }
      ];

      const { data, error } = await supabase.functions.invoke('update-settings', {
        body: settingsToSave,
      });

      if (error) throw error;

      toast.success("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message}`);
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
          <CardTitle>Configuration des APIs</CardTitle>
          <CardDescription>
            Gérez les clés API et les paramètres des services externes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Fournisseur d'IA</Label>
            <Select value={aiProvider} onValueChange={setAiProvider}>
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Sélectionnez un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="claude">Anthropic Claude</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choisissez le service d'IA à utiliser pour la génération de contenu.
            </p>
          </div>

          {aiProvider === 'gemini' && (
            <Card className="p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Paramètres Gemini</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-api-key">Clé API Google Gemini</Label>
                  <div className="relative">
                    <Input
                      id="gemini-api-key"
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Entrez votre clé API Gemini"
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowGeminiKey(!showGeminiKey)}>
                      {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                   <p className="text-sm text-muted-foreground">Obtenez une clé sur <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gemini-model">Modèle Gemini</Label>
                  <Select value={geminiModel} onValueChange={setGeminiModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {geminiModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {aiProvider === 'claude' && (
            <Card className="p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Paramètres Claude</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claude-api-key">Clé API Anthropic Claude</Label>
                  <div className="relative">
                    <Input
                      id="claude-api-key"
                      type={showClaudeKey ? "text" : "password"}
                      value={claudeApiKey}
                      onChange={(e) => setClaudeApiKey(e.target.value)}
                      placeholder="Entrez votre clé API Claude"
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowClaudeKey(!showClaudeKey)}>
                      {showClaudeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Obtenez une clé sur le <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dashboard Anthropic</a>.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claude-model">Modèle Claude</Label>
                  <Select value={claudeModel} onValueChange={setClaudeModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku (Rapide)</SelectItem>
                      <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus (Puissant)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="p-4">
             <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Paramètres de Paiement</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lygos-api-key">Clé API Lygos App</Label>
                  <div className="relative">
                    <Input
                      id="lygos-api-key"
                      type={showLygosKey ? "text" : "password"}
                      value={lygosApiKey}
                      onChange={(e) => setLygosApiKey(e.target.value)}
                      placeholder="Entrez votre clé API Lygos"
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowLygosKey(!showLygosKey)}>
                      {showLygosKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Obtenez une clé sur le <a href="https://docs.lygosapp.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dashboard Lygos App</a>.</p>
                </div>
              </CardContent>
          </Card>

          <Button onClick={saveSettings} disabled={saving} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}