import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { toImagesArray } from "@/lib/utils";

interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  image_url: string[];
  is_premium: boolean;
  keywords: string[];
  synonyms: string[];
  is_active: boolean;
  slug: string;
  similar_products_type?: 'auto' | 'manual';
  category_id?: string | null;
  sub_category_id?: string | null;
}

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { globalPrice } = useSettings();
  const [formData, setFormData] = useState<Product>({
    title: "",
    description: "",
    price: 0,
    image_url: [],
    is_premium: false,
    keywords: [],
    synonyms: [],
    is_active: true,
    slug: "",
    similar_products_type: 'auto',
    category_id: null,
    sub_category_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string; category_id: string }[]>([]);
  const [manualSimilarProducts, setManualSimilarProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('id, name');
      if (categoriesError) toast.error('Erreur lors du chargement des catégories');
      else setCategories(categoriesData || []);

      const { data: subCategoriesData, error: subCategoriesError } = await supabase.from('sub_categories').select('id, name, category_id');
      if (subCategoriesError) toast.error('Erreur lors du chargement des sous-catégories');
      else setSubCategories(subCategoriesData || []);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        image_url: Array.isArray(product.image_url) ? product.image_url : (product.image_url ? [product.image_url] : []),
        keywords: Array.isArray(product.keywords) ? product.keywords : [],
        synonyms: Array.isArray(product.synonyms) ? product.synonyms : [],
        similar_products_type: product.similar_products_type || 'auto',
        category_id: product.category_id || null,
        sub_category_id: product.sub_category_id || null,
      });
    }
  }, [product]);

  useEffect(() => {
    if (product?.id && product.similar_products_type === 'manual') {
        const fetchRelatedProducts = async () => {
            const { data, error } = await supabase
                .from('product_relations')
                .select('similar_product_id')
                .eq('product_id', product.id);

            if (error) {
                console.error("Error fetching related products:", error);
                return;
            }

            const relatedIds = data.map(r => r.similar_product_id);
            if (relatedIds.length > 0) {
                const { data: products, error: productsError } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', relatedIds);

                if (productsError) {
                    console.error("Error fetching product details:", productsError);
                } else {
                    setManualSimilarProducts(products as Product[]);
                }
            }
        };
        fetchRelatedProducts();
    }
  }, [product]);

  useEffect(() => {
    if (!formData.is_premium) {
      setFormData(prev => ({ ...prev, price: 3000 }));
    }
  }, [formData.is_premium]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedProduct;
      const productDataToSave = {
        ...formData,
        price: formData.is_premium ? formData.price : 3000,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      if (product?.id) {
        // Update
        const { data, error } = await supabase
          .from("products")
          .update(productDataToSave)
          .eq("id", product.id)
          .select()
          .single();
        if (error) throw error;
        savedProduct = data;
        toast.success("Produit mis à jour avec succès");
      } else {
        // Create
        const { data, error } = await supabase
          .from("products")
          .insert([productDataToSave])
          .select()
          .single();
        if (error) throw error;
        savedProduct = data;
        toast.success("Produit créé avec succès");
      }

      // Handle similar products relations
      if (savedProduct) {
        const { error: deleteError } = await supabase
          .from('product_relations')
          .delete()
          .eq('product_id', savedProduct.id);

        if (deleteError) {
          console.error("Error clearing old relations:", deleteError);
          // Not throwing, maybe just log
        }

        if (formData.similar_products_type === 'manual' && manualSimilarProducts.length > 0) {
          const relations = manualSimilarProducts.map(p => ({
            product_id: savedProduct.id,
            similar_product_id: p.id,
          }));
          const { error: insertError } = await supabase
            .from('product_relations')
            .insert(relations);

          if (insertError) {
            console.error("Error saving new relations:", insertError);
            toast.error("Erreur lors de la sauvegarde des produits similaires");
          }
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const enhanceWithAI = async () => {
    if (!formData.title.trim()) {
      toast.error("Veuillez saisir un titre avant d'utiliser l'IA");
      return;
    }

    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-product", {
        body: {
          title: formData.title,
          description: formData.description,
        },
      });

      if (error) throw error;

      setFormData({
        ...formData,
        title: data.data?.title || formData.title,
        description: data.data?.description || formData.description,
        keywords: Array.isArray(data.data?.keywords) ? data.data.keywords : formData.keywords,
        synonyms: Array.isArray(data.data?.synonyms) ? data.data.synonyms : formData.synonyms,
      });

      toast.success("Contenu amélioré avec l'IA!");
    } catch (error) {
      console.error("Erreur lors de l'amélioration avec l'IA:", error);
      toast.error("Erreur lors de l'amélioration avec l'IA");
    } finally {
      setEnhancing(false);
    }
  };

  const categorizeWithAI = async () => {
    if (!formData.title.trim()) {
      toast.error("Veuillez saisir un titre avant de suggérer une catégorie.");
      return;
    }
    setCategorizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-alibaba", {
        body: {
          action: 'categorize',
          productTitle: formData.title,
          productDescription: formData.description,
        },
      });

      if (error) throw error;

      if (data.success && data.category && data.subcategory) {
        const { category: categoryName, subcategory: subcategoryName } = data;

        // Find or create category
        let { data: category, error: catError } = await supabase.from('categories').select('id, name').ilike('name', categoryName).single();
        if (catError && catError.code !== 'PGRST116') throw catError; // PGRST116: no rows found
        if (!category) {
          const { data: newCategory, error: newCatError } = await supabase.from('categories').insert({ name: categoryName }).select('id, name').single();
          if (newCatError) throw newCatError;
          category = newCategory;
          setCategories(prev => [...prev, category!]);
        }

        // Find or create sub-category
        let { data: subcategory, error: subCatError } = await supabase.from('sub_categories').select('id, name, category_id').ilike('name', subcategoryName).eq('category_id', category.id).single();
        if (subCatError && subCatError.code !== 'PGRST116') throw subCatError;
        if (!subcategory) {
          const { data: newSubcategory, error: newSubCatError } = await supabase.from('sub_categories').insert({ name: subcategoryName, category_id: category.id }).select('id, name, category_id').single();
          if (newSubCatError) throw newSubCatError;
          subcategory = newSubcategory;
          setSubCategories(prev => [...prev, subcategory!]);
        }
        
        setFormData(prev => ({ ...prev, category_id: category!.id, sub_category_id: subcategory!.id }));
        toast.success(`Catégorie suggérée : ${category.name} > ${subcategory.name}`);

      } else {
        throw new Error(data.error || "La suggestion de catégorie a échoué.");
      }
    } catch (error) {
      console.error("Erreur lors de la suggestion de catégorie:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setCategorizing(false);
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(",").map((k) => k.trim()).filter(Boolean);
    setFormData({ ...formData, keywords });
  };

  const handleSynonymsChange = (value: string) => {
    const synonyms = value.split(",").map((s) => s.trim()).filter(Boolean);
    setFormData({ ...formData, synonyms });
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, image_url, price')
        .ilike('title', `%${term}%`)
        .not('id', 'eq', product?.id || '00000000-0000-0000-0000-000000000000') // Exclude self
        .limit(5);

      if (error) throw error;
      setSearchResults(data as Product[] || []);
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Erreur lors de la recherche de produits");
    } finally {
      setIsSearching(false);
    }
  };

  const addSimilarProduct = (p: Product) => {
    if (!manualSimilarProducts.find(sp => sp.id === p.id)) {
      setManualSimilarProducts([...manualSimilarProducts, p]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeSimilarProduct = (productId: string) => {
    setManualSimilarProducts(manualSimilarProducts.filter(p => p.id !== productId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {product ? "Modifier le Produit" : "Nouveau Produit"}
          {formData.is_premium && (
            <Sparkles className="h-5 w-5 text-premium" />
          )}
        </CardTitle>
        <CardDescription>
          Remplissez les informations du produit. Utilisez l'IA pour améliorer automatiquement le titre, la description, les mots-clés et les synonymes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={enhanceWithAI}
                    disabled={enhancing || categorizing}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {enhancing ? "Amélioration..." : "Améliorer contenu avec IA"}
                  </Button>
                  <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   onClick={categorizeWithAI}
                   disabled={enhancing || categorizing}
                 >
                   <Sparkles className="h-4 w-4 mr-2" />
                   {categorizing ? "Suggestion..." : "Suggérer une catégorie"}
                 </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  value={formData.image_url.join(', ')}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Prix (FCFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  required
                  disabled={!formData.is_premium}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                />
                <Label htmlFor="is_premium">Produit Premium</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Produit Actif</Label>
              </div>

              <div>
                <Label htmlFor="keywords">Mots-clés (séparés par des virgules)</Label>
                <Input
                  id="keywords"
                  value={Array.isArray(formData.keywords) ? formData.keywords.join(", ") : ""}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder="mode, élégant, qualité"
                />
              </div>

              <div>
                <Label htmlFor="synonyms">Synonymes (séparés par des virgules)</Label>
                <Input
                  id="synonyms"
                  value={Array.isArray(formData.synonyms) ? formData.synonyms.join(", ") : ""}
                  onChange={(e) => handleSynonymsChange(e.target.value)}
                  placeholder="vêtement, habit, tenue"
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value, sub_category_id: null })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {formData.category_id && (
                <div>
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <select
                    id="subcategory"
                    value={formData.sub_category_id || ''}
                    onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {subCategories.filter(sc => sc.category_id === formData.category_id).map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Produits Similaires</CardTitle>
                <CardDescription>
                  Choisissez comment les produits similaires sont affichés.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={formData.similar_products_type}
                  onValueChange={(value: 'auto' | 'manual') => setFormData({ ...formData, similar_products_type: value })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto">Automatique</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual">Manuel</Label>
                  </div>
                </RadioGroup>

                {formData.similar_products_type === 'manual' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="search-similar">Rechercher des produits</Label>
                      <Input
                        id="search-similar"
                        placeholder="Titre du produit..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                      {isSearching && <p className="text-sm text-muted-foreground mt-2">Recherche...</p>}
                      {searchResults.length > 0 && (
                        <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                          {searchResults.map(p => (
                            <div key={p.id} onClick={() => addSimilarProduct(p)} className="p-2 hover:bg-accent cursor-pointer flex items-center gap-4">
                              <img src={(toImagesArray(p.image_url as unknown)[0]) || '/placeholder.svg'} alt={p.title} className="w-10 h-10 object-cover rounded" />
                              <div>
                                <p className="font-medium">{p.title}</p>
                                <p className="text-sm text-muted-foreground">{p.price} FCFA</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Produits similaires sélectionnés</Label>
                      {manualSimilarProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground mt-2">Aucun produit sélectionné.</p>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {manualSimilarProducts.map(p => (
                            <Badge key={p.id} variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                              {p.title}
                              <button type="button" onClick={() => removeSimilarProduct(p.id!)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {formData.image_url && (
            <div>
              <Label>Aperçu de l'image</Label>
              <img
                src={Array.isArray(formData.image_url) ? formData.image_url[0] : formData.image_url}
                alt="Aperçu"
                className="w-32 h-32 object-cover rounded mt-2"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}