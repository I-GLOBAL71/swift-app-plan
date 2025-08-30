import { Button } from "@/components/ui/button";
import { ShoppingCart, Crown, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Boutique</h1>
              <p className="text-xs text-muted-foreground">3000 FCFA pour tous</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-base font-medium">
              Accueil
            </Button>
            <Button variant="ghost" className="text-base font-medium">
              Produits
            </Button>
            <Button variant="premium" size="sm" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Premium
            </Button>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                0
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;