import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

// Mock data until DB is ready
const MOCK_PAGES = {
  about: { title: "À Propos de Swift App Plan", content: { description: "Bienvenue sur Swift App Plan...", team: "Notre équipe est composée..." } },
  delivery: { title: "Politique de Livraison", content: { shipping_times: "5 à 7 jours...", shipping_costs: "Calculés au paiement...", order_tracking: "Email avec numéro de suivi..." } },
  returns: { title: "Politique de Retours", content: { return_conditions: "30 jours...", return_procedure: "Contactez le support...", refunds: "5 à 10 jours..." } },
  support: { title: "Contactez-nous", content: { email: "support@swiftappplan.com", phone: "+1 (234) 567-890" } },
  'privacy-policy': { title: 'Politique de Confidentialité', content: { introduction: 'Introduction...', data_collection: 'Collecte des données...' } },
  'terms-of-service': { title: 'Conditions d\'Utilisation', content: { introduction: 'Introduction...', user_obligations: 'Obligations de l\'utilisateur...' } },
};

const PagesManagement = () => {
  const [pages, setPages] = useState(MOCK_PAGES);

  const handleInputChange = (page: keyof typeof MOCK_PAGES, field: string, value: string) => {
    setPages(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        content: { ...prev[page].content, [field]: value }
      }
    }));
  };

  const handleSave = (page: keyof typeof MOCK_PAGES) => {
    console.log("Saving page:", page, pages[page]);
    // Here you would normally call the API to save the data
    toast({
      title: "Page Enregistrée",
      description: `La page "${pages[page].title}" a été mise à jour.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">À Propos</TabsTrigger>
            <TabsTrigger value="delivery">Livraison</TabsTrigger>
            <TabsTrigger value="returns">Retours</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="privacy-policy">Confidentialité</TabsTrigger>
            <TabsTrigger value="terms-of-service">CGU</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{pages.about.title}</h3>
              <div className="space-y-2">
                <Label htmlFor="about-description">Description</Label>
                <Textarea
                  id="about-description"
                  value={pages.about.content.description}
                  onChange={(e) => handleInputChange('about', 'description', e.target.value)}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-team">Équipe</Label>
                <Textarea
                  id="about-team"
                  value={pages.about.content.team}
                  onChange={(e) => handleInputChange('about', 'team', e.target.value)}
                  rows={5}
                />
              </div>
              <Button onClick={() => handleSave('about')}>Enregistrer</Button>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-4">
             <div className="space-y-4">
              <h3 className="text-xl font-semibold">{pages.delivery.title}</h3>
                <div className="space-y-2">
                  <Label htmlFor="delivery-times">Délais de Livraison</Label>
                  <Input
                      id="delivery-times"
                      value={pages.delivery.content.shipping_times}
                      onChange={(e) => handleInputChange('delivery', 'shipping_times', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-costs">Frais de Livraison</Label>
                  <Input
                      id="delivery-costs"
                      value={pages.delivery.content.shipping_costs}
                      onChange={(e) => handleInputChange('delivery', 'shipping_costs', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-tracking">Suivi de Commande</Label>
                  <Input
                      id="delivery-tracking"
                      value={pages.delivery.content.order_tracking}
                      onChange={(e) => handleInputChange('delivery', 'order_tracking', e.target.value)}
                  />
                </div>
              <Button onClick={() => handleSave('delivery')}>Enregistrer</Button>
            </div>
          </TabsContent>

          <TabsContent value="returns" className="mt-4">
             <div className="space-y-4">
              <h3 className="text-xl font-semibold">{pages.returns.title}</h3>
                <div className="space-y-2">
                  <Label htmlFor="returns-conditions">Conditions de Retour</Label>
                  <Textarea
                      id="returns-conditions"
                      value={pages.returns.content.return_conditions}
                      onChange={(e) => handleInputChange('returns', 'return_conditions', e.target.value)}
                      rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returns-procedure">Procédure de Retour</Label>
                  <Textarea
                      id="returns-procedure"
                      value={pages.returns.content.return_procedure}
                      onChange={(e) => handleInputChange('returns', 'return_procedure', e.target.value)}
                      rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returns-refunds">Remboursements</Label>
                  <Textarea
                      id="returns-refunds"
                      value={pages.returns.content.refunds}
                      onChange={(e) => handleInputChange('returns', 'refunds', e.target.value)}
                      rows={4}
                  />
                </div>
              <Button onClick={() => handleSave('returns')}>Enregistrer</Button>
            </div>
          </TabsContent>

          <TabsContent value="support" className="mt-4">
             <div className="space-y-4">
              <h3 className="text-xl font-semibold">{pages.support.title}</h3>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                      id="support-email"
                      value={pages.support.content.email}
                      onChange={(e) => handleInputChange('support', 'email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-phone">Téléphone</Label>
                  <Input
                      id="support-phone"
                      value={pages.support.content.phone}
                      onChange={(e) => handleInputChange('support', 'phone', e.target.value)}
                  />
                </div>
              <Button onClick={() => handleSave('support')}>Enregistrer</Button>
            </div>
          </TabsContent>

          <TabsContent value="privacy-policy" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{pages['privacy-policy'].title}</h3>
              <div className="space-y-2">
                <Label htmlFor="privacy-intro">Introduction</Label>
                <Textarea
                  id="privacy-intro"
                  value={pages['privacy-policy'].content.introduction}
                  onChange={(e) => handleInputChange('privacy-policy', 'introduction', e.target.value)}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy-data">Collecte des données</Label>
                <Textarea
                  id="privacy-data"
                  value={pages['privacy-policy'].content.data_collection}
                  onChange={(e) => handleInputChange('privacy-policy', 'data_collection', e.target.value)}
                  rows={5}
                />
              </div>
              <Button onClick={() => handleSave('privacy-policy')}>Enregistrer</Button>
            </div>
          </TabsContent>

          <TabsContent value="terms-of-service" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{pages['terms-of-service'].title}</h3>
              <div className="space-y-2">
                <Label htmlFor="terms-intro">Introduction</Label>
                <Textarea
                  id="terms-intro"
                  value={pages['terms-of-service'].content.introduction}
                  onChange={(e) => handleInputChange('terms-of-service', 'introduction', e.target.value)}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms-obligations">Obligations de l'utilisateur</Label>
                <Textarea
                  id="terms-obligations"
                  value={pages['terms-of-service'].content.user_obligations}
                  onChange={(e) => handleInputChange('terms-of-service', 'user_obligations', e.target.value)}
                  rows={5}
                />
              </div>
              <Button onClick={() => handleSave('terms-of-service')}>Enregistrer</Button>
            </div>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PagesManagement;