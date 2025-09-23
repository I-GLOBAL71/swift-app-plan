import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceSettings } from "./PriceSettings";
import { CoolPaySettings } from "./CoolPaySettings";
import { ApiSettings } from "./ApiSettings";
import { PremiumSettings } from "./PremiumSettings";
import SocialLinksSettings from "./SocialLinksSettings";
import { toast } from "sonner";
import { Save, Settings, DollarSign, Palette, Star, Share2 } from "lucide-react";

interface Settings {
  site_name?: string;
  site_email?: string;
  site_description?: string;
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["site_name", "site_email", "site_description"]);

      if (error) throw error;

      const settingsObj: Settings = {};
      data?.forEach((item) => {
        settingsObj[item.key as keyof Settings] = item.value;
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        description: getSettingDescription(key)
      }));

      for (const setting of settingsArray) {
        const { error } = await supabase
          .from("settings")
          .upsert(setting);
        if (error) throw error;
      }

      toast.success("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const getSettingDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      site_name: "Nom affiché du site web",
      site_email: "Adresse email de contact principal",
      site_description: "Description générale du site"
    };
    return descriptions[key] || "";
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Paramètres</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Prix
          </TabsTrigger>
          <TabsTrigger value="coolpay" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            CoolPay
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Premium
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Réseaux Sociaux
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Générale
              </CardTitle>
              <CardDescription>
                Gérez les paramètres globaux de votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site_name">Nom du site</Label>
                    <Input
                      id="site_name"
                      value={settings.site_name || ""}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="site_email">Email de contact</Label>
                    <Input
                      id="site_email"
                      type="email"
                      value={settings.site_email || ""}
                      onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="site_description">Description du site</Label>
                  <Input
                    id="site_description"
                    value={settings.site_description || ""}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </form>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="api">
            <ApiSettings />
          </TabsContent>

          <TabsContent value="pricing">
            <PriceSettings />
          </TabsContent>
        <TabsContent value="coolpay">
          <CoolPaySettings />
        </TabsContent>
        <TabsContent value="premium">
          <PremiumSettings />
        </TabsContent>
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Liens des Réseaux Sociaux
              </CardTitle>
              <CardDescription>
                Gérez les liens vers vos pages de réseaux sociaux.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialLinksSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}