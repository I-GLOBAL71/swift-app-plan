import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { CitiesManagement } from "@/components/admin/CitiesManagement";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { SettingsManagement } from "@/components/admin/SettingsManagement";
import SectionsManagement from "@/components/admin/SectionsManagement";
import HeroSlidesManagement from "@/components/admin/HeroSlidesManagement";
import PagesManagement from "@/components/admin/PagesManagement";
import { CategoriesManagement } from "@/components/admin/CategoriesManagement";
import PushNotifications from "@/components/admin/PushNotifications";
import PaymentMethodSettings from "@/components/admin/PaymentMethodSettings";
import { LogOut, Package, ShoppingCart, BarChart3, Settings, Layout, MapPin, Presentation, Menu, FileText, FolderTree, Bell, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type TabValue = "dashboard" | "hero" | "sections" | "products" | "categories" | "orders" | "cities" | "pages" | "notifications" | "settings" | "payment";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("dashboard");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Administration</h1>
          <div className="flex items-center gap-2 md:gap-4">
            {!isMobile && (
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user?.email}
              </span>
            )}
            <Button variant="outline" onClick={handleLogout} size={isMobile ? "icon" : "default"}>
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="space-y-6">
          {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Menu className="h-4 w-4" />
                  <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-2 py-4">
                  {renderTabButton("dashboard", "Tableau de Bord", <BarChart3 className="h-4 w-4" />)}
                  {renderTabButton("hero", "Hero", <Presentation className="h-4 w-4" />)}
                  {renderTabButton("sections", "Sections", <Layout className="h-4 w-4" />)}
                  {renderTabButton("products", "Produits", <Package className="h-4 w-4" />)}
                  {renderTabButton("categories", "Catégories", <FolderTree className="h-4 w-4" />)}
                  {renderTabButton("orders", "Commandes", <ShoppingCart className="h-4 w-4" />)}
                  {renderTabButton("cities", "Villes", <MapPin className="h-4 w-4" />)}
                  {renderTabButton("pages", "Pages", <FileText className="h-4 w-4" />)}
                  {renderTabButton("notifications", "Notifications", <Bell className="h-4 w-4" />)}
                  {renderTabButton("payment", "Paiements", <CreditCard className="h-4 w-4" />)}
                  {renderTabButton("settings", "Paramètres", <Settings className="h-4 w-4" />)}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Tableau de Bord
                </TabsTrigger>
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Presentation className="h-4 w-4" />
                  Hero
                </TabsTrigger>
                <TabsTrigger value="sections" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Sections
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produits
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Catégories
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Commandes
                </TabsTrigger>
                <TabsTrigger value="cities" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Villes
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Pages
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Paiements
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          <TabsContent value="dashboard">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="hero">
            <HeroSlidesManagement />
          </TabsContent>

          <TabsContent value="sections">
            <SectionsManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="cities">
            <CitiesManagement />
          </TabsContent>

          <TabsContent value="pages">
            <PagesManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <PushNotifications />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentMethodSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

  function renderTabButton(tab: TabValue, label: string, icon: React.ReactNode) {
    return (
      <Button
        variant={activeTab === tab ? "secondary" : "ghost"}
        className="w-full justify-start gap-2"
        onClick={() => {
          setActiveTab(tab);
          setIsSheetOpen(false);
        }}
      >
        {icon}
        {label}
      </Button>
    );
  }
}