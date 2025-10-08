import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, GripVertical, Settings, Package } from "lucide-react";
import ProductSelector from "./ProductSelector";

interface Section {
  id: string;
  title: string;
  description: string;
  position: number;
  is_active: boolean;
  style_type: string;
  background_color: string;
  text_color: string;
  max_products: number;
  show_premium_only: boolean;
  show_standard_only: boolean;
  selection_mode: 'automatic' | 'manual' | 'mixed';
  mobile_product_columns: number;
}

const SectionsManagement = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position: 0,
    is_active: true,
    style_type: "grid",
    background_color: "transparent",
    text_color: "foreground",
    max_products: 8,
    show_premium_only: false,
    show_standard_only: false,
    selection_mode: "automatic" as 'automatic' | 'manual' | 'mixed',
    mobile_product_columns: 1,
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      setSections((data || []).map((section: any) => ({
        ...section,
        selection_mode: section.selection_mode || 'automatic'
      })));
    } catch (error) {
      toast.error("Erreur lors du chargement des sections");
      console.error("Error loading sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        const { error } = await supabase
          .from("sections")
          .update(formData)
          .eq("id", editingSection.id);

        if (error) throw error;
        toast.success("Section mise à jour avec succès");
      } else {
        const { error } = await supabase
          .from("sections")
          .insert([{ ...formData, type: 'custom' }]);

        if (error) throw error;
        toast.success("Section créée avec succès");
      }

      resetForm();
      loadSections();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error("Error saving section:", error);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      description: section.description || "",
      position: section.position,
      is_active: section.is_active,
      style_type: section.style_type,
      background_color: section.background_color,
      text_color: section.text_color,
      max_products: section.max_products,
      show_premium_only: section.show_premium_only,
      show_standard_only: section.show_standard_only,
      selection_mode: section.selection_mode || 'automatic',
      mobile_product_columns: section.mobile_product_columns || 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) return;

    try {
      const { error } = await supabase
        .from("sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Section supprimée avec succès");
      loadSections();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error("Error deleting section:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      position: 0,
      is_active: true,
      style_type: "grid",
      background_color: "transparent",
      text_color: "foreground",
      max_products: 8,
      show_premium_only: false,
      show_standard_only: false,
      selection_mode: "automatic",
      mobile_product_columns: 1,
    });
    setEditingSection(null);
    setShowForm(false);
  };

  const handleProductSelector = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowProductSelector(true);
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {editingSection ? "Modifier la section" : "Nouvelle section"}
          </CardTitle>
          <CardDescription>
            Créez des sections attrayantes pour votre page d'accueil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la section..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mobile_product_columns">Colonnes sur mobile</Label>
                <Input
                  id="mobile_product_columns"
                  type="number"
                  min="1"
                  max="3"
                  value={formData.mobile_product_columns}
                  onChange={(e) => setFormData({ ...formData, mobile_product_columns: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="style_type">Style</Label>
                <Select
                  value={formData.style_type}
                  onValueChange={(value) => setFormData({ ...formData, style_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grille standard</SelectItem>
                    <SelectItem value="premium">Style premium</SelectItem>
                    <SelectItem value="carousel">Carrousel</SelectItem>
                    <SelectItem value="featured">Mise en avant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_products">Nombre maximum de produits</Label>
                <Input
                  id="max_products"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max_products}
                  onChange={(e) => setFormData({ ...formData, max_products: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <Label htmlFor="background_color">Couleur de fond</Label>
                <Select
                  value={formData.background_color}
                  onValueChange={(value) => setFormData({ ...formData, background_color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transparent">Transparent</SelectItem>
                    <SelectItem value="muted">Fond subtil</SelectItem>
                    <SelectItem value="accent">Accent</SelectItem>
                    <SelectItem value="secondary">Secondaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Section active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show_premium_only"
                  checked={formData.show_premium_only}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_premium_only: checked, show_standard_only: checked ? false : formData.show_standard_only })}
                />
                <Label htmlFor="show_premium_only">Afficher uniquement les produits premium</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show_standard_only"
                  checked={formData.show_standard_only}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_standard_only: checked, show_premium_only: checked ? false : formData.show_premium_only })}
                />
                <Label htmlFor="show_standard_only">Afficher uniquement les produits standards</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="selection_mode">Mode de sélection des produits</Label>
                <Select
                  value={formData.selection_mode}
                  onValueChange={(value: 'automatic' | 'manual' | 'mixed') => 
                    setFormData({ ...formData, selection_mode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatique (filtres)</SelectItem>
                    <SelectItem value="manual">Manuel (sélection directe)</SelectItem>
                    <SelectItem value="mixed">Mixte (filtres + sélection)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.selection_mode === 'automatic' && "Les produits sont affichés selon les filtres définis"}
                  {formData.selection_mode === 'manual' && "Vous sélectionnez manuellement les produits à afficher"}
                  {formData.selection_mode === 'mixed' && "Combine filtres automatiques et sélection manuelle"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingSection ? "Mettre à jour" : "Créer"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (showProductSelector && selectedSectionId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowProductSelector(false)}>
            ← Retour aux sections
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Gestion des Produits</h2>
            <p className="text-muted-foreground">
              Sélectionnez les produits pour cette section
            </p>
          </div>
        </div>
        <ProductSelector
          sectionId={selectedSectionId}
          onClose={() => setShowProductSelector(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Sections</h2>
          <p className="text-muted-foreground">
            Personnalisez les sections de votre page d'accueil
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Aucune section créée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Position: {section.position} • Style: {section.style_type}
                        {section.show_premium_only && " • Premium uniquement"}
                        {section.show_standard_only && " • Standard uniquement"}
                      </p>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${section.is_active ? "bg-green-500" : "bg-red-500"}`} />
                      {(section.selection_mode === 'manual' || section.selection_mode === 'mixed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProductSelector(section.id)}
                          title="Gérer les produits de la section"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionsManagement;