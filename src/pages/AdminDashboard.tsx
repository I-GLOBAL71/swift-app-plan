import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { CitiesManagement } from "@/components/admin/CitiesManagement";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { SettingsManagement } from "@/components/admin/SettingsManagement";
import SectionsManagement from "@/components/admin/SectionsManagement";
import { LogOut, Package, ShoppingCart, BarChart3, Settings, Layout, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Vérifier si l'utilisateur est admin
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!adminUser) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panneau d'Administration</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Connecté en tant que: {user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Villes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="sections">
            <SectionsManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="cities">
            <CitiesManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}