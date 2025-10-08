import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: any;
  is_premium: boolean;
  slug: string;
}

interface SectionProduct {
  id: string;
  section_id: string;
  product_id: string;
  position: number;
  product?: Product;
}

interface ProductSelectorProps {
  sectionId: string;
  onClose: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ sectionId, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SectionProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
    setLoading(false); // Simplified for now - just load products
  }, [sectionId]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, image_url, is_premium")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
      console.error("Error loading products:", error);
    }
  };

  const getImageUrl = (imageUrl: any): string => {
    if (!imageUrl) return "/placeholder.svg";
    if (typeof imageUrl === "string") return imageUrl;
    if (Array.isArray(imageUrl) && imageUrl.length > 0) return imageUrl[0];
    return "/placeholder.svg";
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedProducts.some(sp => sp.product_id === product.id)
  );

  const handleAddProduct = async (product: Product) => {
    // For now, just add to local state
    const newSectionProduct: SectionProduct = {
      id: `temp-${Date.now()}`,
      section_id: sectionId,
      product_id: product.id,
      position: selectedProducts.length,
      product
    };
    
    setSelectedProducts(prev => [...prev, newSectionProduct]);
    toast.success("Produit ajouté à la section (mode démo)");
  };

  const handleRemoveProduct = (sectionProductId: string) => {
    setSelectedProducts(prev => prev.filter(sp => sp.id !== sectionProductId));
    toast.success("Produit retiré de la section");
  };

  const handleReorderProducts = (startIndex: number, endIndex: number) => {
    const newSelectedProducts = [...selectedProducts];
    const [removed] = newSelectedProducts.splice(startIndex, 1);
    newSelectedProducts.splice(endIndex, 0, removed);

    setSelectedProducts(newSelectedProducts.map((sp, index) => ({
      ...sp,
      position: index
    })));

    toast.success("Ordre des produits mis à jour");
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Produits disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Produits disponibles
          </CardTitle>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <img
                src={getImageUrl(product.image_url)}
                alt={product.title}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{product.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold">{product.price}€</span>
                  {product.is_premium && (
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddProduct(product)}
                disabled={saving}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "Aucun produit trouvé" : "Tous les produits sont déjà sélectionnés"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Produits sélectionnés */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Produits sélectionnés ({selectedProducts.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
              Fermer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
          {selectedProducts.map((sectionProduct, index) => (
            <div key={sectionProduct.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <span className="text-sm font-mono text-muted-foreground w-6">
                {index + 1}
              </span>
              <img
                src={getImageUrl(sectionProduct.product?.image_url)}
                alt={sectionProduct.product?.title || "Produit"}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{sectionProduct.product?.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold">{sectionProduct.product?.price}€</span>
                  {sectionProduct.product?.is_premium && (
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReorderProducts(index, index - 1)}
                    disabled={saving}
                  >
                    ↑
                  </Button>
                )}
                {index < selectedProducts.length - 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReorderProducts(index, index + 1)}
                    disabled={saving}
                  >
                    ↓
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveProduct(sectionProduct.id)}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {selectedProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun produit sélectionné pour cette section
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSelector;