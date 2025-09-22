import { Button } from "@/components/ui/button";
import { Crown, Menu, X } from "lucide-react";
import { CartButton } from "./CartButton";
import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { globalPrice } = useSettings();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg sm:text-xl">B</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Boutique</h1>
              <p className="text-xs text-muted-foreground">{globalPrice.toLocaleString()} FCFA pour tous</p>
            </div>
          </Link>

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

          <div className="flex items-center space-x-1 sm:space-x-3">
            <CartButton />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-3">
              <Button 
                variant="ghost" 
                className="text-base font-medium justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Button>
              <Button 
                variant="ghost" 
                className="text-base font-medium justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Produits
              </Button>
              <Button 
                variant="premium" 
                size="sm" 
                className="flex items-center gap-2 justify-start w-fit"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Crown className="w-4 h-4" />
                Premium
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;