import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';

interface CoolPaySettings {
  coolpay_public_key?: string;
  coolpay_private_key?: string;
  coolpay_environment?: string;
}

export function CoolPaySettings() {
  const [settings, setSettings] = useState<CoolPaySettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['coolpay_public_key', 'coolpay_private_key', 'coolpay_environment']);

      if (error) throw error;

      const settingsObj: CoolPaySettings = {};
      data?.forEach((setting) => {
        settingsObj[setting.key as keyof CoolPaySettings] = setting.value || '';
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error loading CoolPay settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres CoolPay",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value || '',
        description: getSettingDescription(key)
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Paramètres CoolPay sauvegardés avec succès",
      });
    } catch (error) {
      console.error('Error saving CoolPay settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres CoolPay",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions = {
      coolpay_public_key: 'Clé publique CoolPay pour les transactions',
      coolpay_private_key: 'Clé privée CoolPay (gardez-la secrète)',
      coolpay_environment: 'Environnement CoolPay (sandbox ou production)'
    };
    return descriptions[key as keyof typeof descriptions] || '';
  };

  const handleInputChange = (key: keyof CoolPaySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Paramètres CoolPay
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://documenter.getpostman.com/view/17178321/UV5ZCx8f', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="coolpay-public-key">Clé publique CoolPay</Label>
            <Input
              id="coolpay-public-key"
              value={settings.coolpay_public_key || ''}
              onChange={(e) => handleInputChange('coolpay_public_key', e.target.value)}
              placeholder="Entrez votre clé publique CoolPay"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Cette clé sera utilisée côté client pour initialiser les paiements
            </p>
          </div>

          <div>
            <Label htmlFor="coolpay-private-key">Clé privée CoolPay</Label>
            <div className="relative">
              <Input
                id="coolpay-private-key"
                type={showPrivateKey ? "text" : "password"}
                value={settings.coolpay_private_key || ''}
                onChange={(e) => handleInputChange('coolpay_private_key', e.target.value)}
                placeholder="Entrez votre clé privée CoolPay"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
              >
                {showPrivateKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cette clé sera utilisée côté serveur pour vérifier les transactions
            </p>
          </div>

          <div>
            <Label htmlFor="coolpay-environment">Environnement</Label>
            <select
              id="coolpay-environment"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={settings.coolpay_environment || 'sandbox'}
              onChange={(e) => handleInputChange('coolpay_environment', e.target.value)}
            >
              <option value="sandbox">Sandbox (Test)</option>
              <option value="production">Production</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              Utilisez "Sandbox" pour les tests et "Production" pour les vraies transactions
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Instructions de configuration :</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Créez un compte sur <a href="https://my-coolpay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">my-coolpay.com</a></li>
            <li>• Récupérez vos clés API depuis votre tableau de bord CoolPay</li>
            <li>• Commencez par l'environnement Sandbox pour les tests</li>
            <li>• Consultez la <a href="https://documenter.getpostman.com/view/17178321/UV5ZCx8f" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">documentation API</a></li>
          </ul>
        </div>

        <Button onClick={saveSettings} disabled={saving} className="w-full">
          {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </Button>
      </CardContent>
    </Card>
  );
}