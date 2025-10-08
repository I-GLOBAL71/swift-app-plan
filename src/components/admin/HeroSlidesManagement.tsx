import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Image, Link, Eye, EyeOff, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { HeroSlide } from "@/lib/types";

const HeroSlidesManagement = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link: "",
    created_at: ""
  });

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error("Error loading hero slides:", error);
      toast.error("Erreur lors du chargement des diapositives");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      link: "",
      created_at: ""
    });
    setEditingSlide(null);
  };

  const openDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        image_url: slide.image_url,
        link: slide.link,
        created_at: slide.created_at
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result;
      const slideData = { ...formData };

      if (editingSlide) {
        result = await supabase
          .from("hero_slides")
          .update(slideData)
          .eq("id", editingSlide.id)
          .select();
      } else {
        result = await supabase.from("hero_slides").insert(slideData).select();
      }

      const { data, error } = result;

      if (error) throw error;

      if (data) {
        toast.success(
          `Diapositive ${editingSlide ? "mise à jour" : "créée"} avec succès`
        );
        setIsDialogOpen(false);
        resetForm();
        loadSlides();
      }
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette diapositive ?")) return;

    try {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
      toast.success("Diapositive supprimée avec succès");
      loadSlides();
    } catch (error) {
      console.error("Error deleting slide:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success("Statut de la diapositive mis à jour");
      loadSlides();
    } catch (error) {
      console.error("Error toggling slide:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  if (loading) {
    return <div className="p-4">Chargement des diapositives...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Diapositives Hero</h2>
          <p className="text-muted-foreground">
            Gérez les diapositives du carrousel de la page d'accueil
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Diapositive
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? "Modifier la diapositive" : "Nouvelle diapositive"}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour créer ou modifier une diapositive.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre Principal *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="ex: Shopping"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Sous-titre *</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    placeholder="ex: Simple & Accessible"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description complète de la diapositive..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image *</Label>
                <div className="flex gap-2">
                  <Image className="w-5 h-5 mt-2 text-muted-foreground" />
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">Texte du Bouton *</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    placeholder="ex: Découvrir nos produits"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="button_link">Lien du Bouton *</Label>
                  <div className="flex gap-2">
                    <Link className="w-5 h-5 mt-2 text-muted-foreground" />
                    <Input
                      id="button_link"
                      value={formData.button_link}
                      onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                      placeholder="#products ou /premium ou https://..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_index">Ordre d'affichage</Label>
                  <Input
                    id="order_index"
                    type="number"
                    min="0"
                    value={formData.order_index}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Diapositive active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingSlide ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {slides.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune diapositive créée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {slides.map((slide) => (
            <Card key={slide.id} className={`transition-opacity ${!slide.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                    <div>
                      <CardTitle className="text-lg">{slide.title} - {slide.subtitle}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={slide.is_active ? "default" : "secondary"}>
                          {slide.is_active ? (
                            <><Eye className="w-3 h-3 mr-1" /> Active</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                        <Badge variant="outline">Ordre: {slide.order_index}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(slide.id, slide.is_active)}
                    >
                      {slide.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(slide)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(slide.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {slide.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Bouton: "{slide.button_text}"</span>
                      <span>→ {slide.button_link}</span>
                    </div>
                  </div>
                  
                  {slide.image_url && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlidesManagement;