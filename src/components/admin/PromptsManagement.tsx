import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";

interface Prompt {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
}

const PROMPTS: Prompt[] = [
  {
    key: "prompt_title",
    label: "Réécriture de Titre",
    description: "Prompt pour réécrire les titres de produits",
    defaultValue: "Réécris ce titre de produit en français de manière précise, concise, accrocheuse et émotionnelle pour un site e-commerce. Le titre doit susciter l'émotion du visiteur, créer du désir et être optimisé pour le SEO. Maximum 80 caractères."
  },
  {
    key: "prompt_description",
    label: "Réécriture de Description",
    description: "Prompt pour réécrire les descriptions de produits",
    defaultValue: "Réécris cette description de produit en français de manière accrocheuse pour un site e-commerce. STRUCTURE OBLIGATOIRE : Commence par une introduction listant exactement 7 points forts et exceptionnels du produit (format : ✓ Point fort 1, ✓ Point fort 2, etc.), puis développe une description détaillée et engageante. Utilise un langage commercial attractif qui suscite l'émotion et le désir d'achat."
  },
  {
    key: "prompt_keywords",
    label: "Génération de Mots-clés",
    description: "Prompt pour générer des mots-clés SEO",
    defaultValue: "Génère une liste de 10-15 mots-clés pertinents en français pour ce produit, séparés par des virgules. Focus sur les termes de recherche populaires et les expressions utilisées par les acheteurs potentiels."
  },
  {
    key: "prompt_synonyms",
    label: "Génération de Synonymes",
    description: "Prompt pour générer des synonymes et termes alternatifs",
    defaultValue: "Génère une liste de synonymes et termes alternatifs en français pour ce produit, séparés par des virgules. Inclus les variations linguistiques courantes, les termes techniques et les appellations alternatives du produit."
  }
];

export function PromptsManagement() {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", PROMPTS.map(p => p.key));

      if (error) throw error;

      const promptsData: Record<string, string> = {};
      PROMPTS.forEach(prompt => {
        const setting = data?.find(d => d.key === prompt.key);
        promptsData[prompt.key] = setting?.value || prompt.defaultValue;
      });

      setPrompts(promptsData);
    } catch (error) {
      console.error("Error loading prompts:", error);
      toast.error("Erreur lors du chargement des prompts");
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async (key: string) => {
    setSaving(key);
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          key,
          value: prompts[key],
          description: PROMPTS.find(p => p.key === key)?.description
        });

      if (error) throw error;

      toast.success("Prompt sauvegardé avec succès");
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Erreur lors de la sauvegarde du prompt");
    } finally {
      setSaving(null);
    }
  };

  const resetPrompt = (key: string) => {
    const defaultValue = PROMPTS.find(p => p.key === key)?.defaultValue || "";
    setPrompts(prev => ({ ...prev, [key]: defaultValue }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">Chargement des prompts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestion des Prompts IA</h2>
        <p className="text-muted-foreground">
          Configurez les prompts utilisés pour la réécriture automatique des produits importés depuis Alibaba.
        </p>
      </div>

      {PROMPTS.map((prompt) => (
        <Card key={prompt.key}>
          <CardHeader>
            <CardTitle>{prompt.label}</CardTitle>
            <CardDescription>{prompt.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={prompt.key}>Prompt</Label>
              <Textarea
                id={prompt.key}
                value={prompts[prompt.key] || ""}
                onChange={(e) => setPrompts(prev => ({ ...prev, [prompt.key]: e.target.value }))}
                placeholder={prompt.defaultValue}
                rows={4}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => savePrompt(prompt.key)}
                disabled={saving === prompt.key}
                className="flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving === prompt.key ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => resetPrompt(prompt.key)}
                disabled={saving === prompt.key}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}