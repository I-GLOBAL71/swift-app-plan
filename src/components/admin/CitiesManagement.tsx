import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Save, X } from 'lucide-react';

interface City {
  id: string;
  name: string;
  region: string;
  shipping_fee: number;
  payment_required_before_shipping: boolean;
  delivery_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 
  'Nord', 'Extrême-Nord', 'Est', 'Sud', 'Adamaoua'
];

export function CitiesManagement() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCity, setNewCity] = useState({
    name: '',
    region: '',
    shipping_fee: 0,
    payment_required_before_shipping: false,
    delivery_days: 3
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cameroon_cities')
        .select('*')
        .order('region')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les villes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async () => {
    if (!newCity.name || !newCity.region) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cameroon_cities')
        .insert([newCity]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Ville ajoutée avec succès",
      });

      setNewCity({
        name: '',
        region: '',
        shipping_fee: 0,
        payment_required_before_shipping: false,
        delivery_days: 3
      });
      setShowAddForm(false);
      loadCities();
    } catch (error) {
      console.error('Error adding city:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la ville",
        variant: "destructive",
      });
    }
  };

  const toggleCityStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('cameroon_cities')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Ville ${isActive ? 'activée' : 'désactivée'} avec succès`,
      });
      loadCities();
    } catch (error) {
      console.error('Error updating city status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Villes</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une ville
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une nouvelle ville</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la ville</Label>
                  <Input
                    id="name"
                    value={newCity.name}
                    onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                    placeholder="Ex: Douala"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Région</Label>
                  <Input
                    id="region"
                    value={newCity.region}
                    onChange={(e) => setNewCity({ ...newCity, region: e.target.value })}
                    placeholder="Ex: Littoral"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_fee">Frais de livraison (FCFA)</Label>
                  <Input
                    id="shipping_fee"
                    type="number"
                    value={newCity.shipping_fee}
                    onChange={(e) => setNewCity({ ...newCity, shipping_fee: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 2000"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_days">Délai de livraison (jours)</Label>
                  <Input
                    id="delivery_days"
                    type="number"
                    min="1"
                    max="30"
                    value={newCity.delivery_days}
                    onChange={(e) => setNewCity({ ...newCity, delivery_days: parseInt(e.target.value) || 3 })}
                    placeholder="Ex: 3"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="payment_required"
                      checked={newCity.payment_required_before_shipping}
                      onCheckedChange={(checked) => 
                        setNewCity({ ...newCity, payment_required_before_shipping: checked as boolean })
                      }
                    />
                    <Label htmlFor="payment_required" className="text-sm">
                      Paiement obligatoire avant expédition
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCity}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des villes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ville</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Frais de livraison</TableHead>
                <TableHead>Délai (jours)</TableHead>
                <TableHead>Paiement obligatoire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{city.region}</TableCell>
                  <TableCell>{city.shipping_fee.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant="outline">{city.delivery_days} jour{city.delivery_days > 1 ? 's' : ''}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={city.payment_required_before_shipping ? "destructive" : "secondary"}>
                      {city.payment_required_before_shipping ? "Obligatoire" : "Optionnel"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={city.is_active ? "default" : "secondary"}>
                      {city.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCity(city)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant={city.is_active ? "destructive" : "default"}
                        onClick={() => toggleCityStatus(city.id, !city.is_active)}
                      >
                        {city.is_active ? "Désactiver" : "Activer"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}