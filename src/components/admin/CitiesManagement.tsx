import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Save, X, Plus } from 'lucide-react';

interface City {
  id: string;
  name: string;
  region: string;
  shipping_fee: number;
  payment_required_before_shipping: boolean;
  is_active: boolean;
}

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 
  'Nord', 'Extrême-Nord', 'Est', 'Sud', 'Adamaoua'
];

export function CitiesManagement() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<City>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCityForm, setNewCityForm] = useState({
    name: '',
    region: '',
    shipping_fee: 0,
    payment_required_before_shipping: false
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
        .order('region', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les villes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city: City) => {
    setEditingId(city.id);
    setEditForm(city);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('cameroon_cities')
        .update({
          shipping_fee: editForm.shipping_fee,
          payment_required_before_shipping: editForm.payment_required_before_shipping,
          is_active: editForm.is_active
        })
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Ville mise à jour avec succès",
      });
      
      setEditingId(null);
      loadCities();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la ville",
        variant: "destructive",
      });
    }
  };

  const handleAddCity = async () => {
    if (!newCityForm.name || !newCityForm.region) {
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
        .insert([{
          name: newCityForm.name,
          region: newCityForm.region,
          shipping_fee: newCityForm.shipping_fee * 100, // Convert to cents
          payment_required_before_shipping: newCityForm.payment_required_before_shipping
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Nouvelle ville ajoutée avec succès",
      });
      
      setShowAddForm(false);
      setNewCityForm({
        name: '',
        region: '',
        shipping_fee: 0,
        payment_required_before_shipping: false
      });
      loadCities();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la ville",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('fr-FR') + ' XAF';
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Villes du Cameroun</CardTitle>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter une ville
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-medium mb-4">Ajouter une nouvelle ville</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-city-name">Nom de la ville *</Label>
                  <Input
                    id="new-city-name"
                    value={newCityForm.name}
                    onChange={(e) => setNewCityForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Yaoundé"
                  />
                </div>
                <div>
                  <Label htmlFor="new-city-region">Région *</Label>
                  <Select
                    value={newCityForm.region}
                    onValueChange={(value) => setNewCityForm(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMEROON_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-city-shipping">Frais d'expédition (XAF)</Label>
                  <Input
                    id="new-city-shipping"
                    type="number"
                    value={newCityForm.shipping_fee}
                    onChange={(e) => setNewCityForm(prev => ({ ...prev, shipping_fee: parseInt(e.target.value) || 0 }))}
                    placeholder="1500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-city-payment"
                    checked={newCityForm.payment_required_before_shipping}
                    onCheckedChange={(checked) => setNewCityForm(prev => ({ ...prev, payment_required_before_shipping: checked }))}
                  />
                  <Label htmlFor="new-city-payment">Paiement obligatoire avant expédition</Label>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button onClick={handleAddCity}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ville</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Frais d'expédition</TableHead>
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
                  <TableCell>
                    {editingId === city.id ? (
                      <Input
                        type="number"
                        value={(editForm.shipping_fee || 0) / 100}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          shipping_fee: parseInt(e.target.value) * 100 || 0 
                        }))}
                        className="w-32"
                      />
                    ) : (
                      formatPrice(city.shipping_fee)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === city.id ? (
                      <Switch
                        checked={editForm.payment_required_before_shipping}
                        onCheckedChange={(checked) => setEditForm(prev => ({ 
                          ...prev, 
                          payment_required_before_shipping: checked 
                        }))}
                      />
                    ) : (
                      <Badge variant={city.payment_required_before_shipping ? "default" : "secondary"}>
                        {city.payment_required_before_shipping ? 'Obligatoire' : 'Optionnel'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === city.id ? (
                      <Switch
                        checked={editForm.is_active}
                        onCheckedChange={(checked) => setEditForm(prev => ({ 
                          ...prev, 
                          is_active: checked 
                        }))}
                      />
                    ) : (
                      <Badge variant={city.is_active ? "default" : "destructive"}>
                        {city.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === city.id ? (
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSave}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEdit(city)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
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