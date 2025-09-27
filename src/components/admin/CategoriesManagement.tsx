import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
}

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase.from('categories').select('*').order('name');
      if (catError) throw catError;
      setCategories(catData || []);

      const { data: subCatData, error: subCatError } = await supabase.from('sub_categories').select('*').order('name');
      if (subCatError) throw subCatError;
      setSubCategories(subCatData || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { data, error } = await supabase.from('categories').insert({ name: newCategoryName }).select().single();
      if (error) throw error;
      setCategories([...categories, data]);
      setNewCategoryName('');
      toast.success('Catégorie ajoutée.');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la catégorie.');
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategoryName.trim() || !selectedCategoryId) return;
    try {
      const { data, error } = await supabase.from('sub_categories').insert({ name: newSubCategoryName, category_id: selectedCategoryId }).select().single();
      if (error) throw error;
      setSubCategories([...subCategories, data]);
      setNewSubCategoryName('');
      toast.success('Sous-catégorie ajoutée.');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la sous-catégorie.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      fetchData(); // Refetch all data
      toast.success('Catégorie supprimée.');
    } catch (error) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleDeleteSubCategory = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette sous-catégorie ?')) return;
    try {
      const { error } = await supabase.from('sub_categories').delete().eq('id', id);
      if (error) throw error;
      setSubCategories(subCategories.filter(sc => sc.id !== id));
      toast.success('Sous-catégorie supprimée.');
    } catch (error) {
      toast.error('Erreur lors de la suppression.');
    }
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    try {
      const { data, error } = await supabase.from('categories').update({ name: editingCategory.name }).eq('id', editingCategory.id).select().single();
      if (error) throw error;
      setCategories(categories.map(c => c.id === data.id ? data : c));
      setEditingCategory(null);
      toast.success('Catégorie mise à jour.');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!editingSubCategory || !editingSubCategory.name.trim()) return;
    try {
      const { data, error } = await supabase.from('sub_categories').update({ name: editingSubCategory.name }).eq('id', editingSubCategory.id).select().single();
      if (error) throw error;
      setSubCategories(subCategories.map(sc => sc.id === data.id ? data : sc));
      setEditingSubCategory(null);
      toast.success('Sous-catégorie mise à jour.');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gérer les Catégories</CardTitle>
          <CardDescription>Ajouter, modifier ou supprimer des catégories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nom de la nouvelle catégorie"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button onClick={handleAddCategory}><Plus className="h-4 w-4" /></Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className={selectedCategoryId === cat.id ? 'bg-accent' : ''}>
                  <TableCell>
                    {editingCategory?.id === cat.id ? (
                      <Input value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} />
                    ) : (
                      cat.name
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingCategory?.id === cat.id ? (
                      <Button size="sm" onClick={handleUpdateCategory}>Sauver</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setEditingCategory(cat)}><Edit className="h-4 w-4" /></Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(cat.id)} className="ml-2"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gérer les Sous-catégories</CardTitle>
          <CardDescription>{selectedCategoryId ? `Pour la catégorie: ${categories.find(c=>c.id === selectedCategoryId)?.name}` : 'Sélectionnez une catégorie'}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedCategoryId && (
            <>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nom de la nouvelle sous-catégorie"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                />
                <Button onClick={handleAddSubCategory}><Plus className="h-4 w-4" /></Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subCategories.filter(sc => sc.category_id === selectedCategoryId).map(subCat => (
                    <TableRow key={subCat.id}>
                      <TableCell>
                        {editingSubCategory?.id === subCat.id ? (
                          <Input value={editingSubCategory.name} onChange={(e) => setEditingSubCategory({...editingSubCategory, name: e.target.value})} />
                        ) : (
                          subCat.name
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingSubCategory?.id === subCat.id ? (
                          <Button size="sm" onClick={handleUpdateSubCategory}>Sauver</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setEditingSubCategory(subCat)}><Edit className="h-4 w-4" /></Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSubCategory(subCat.id)} className="ml-2"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}