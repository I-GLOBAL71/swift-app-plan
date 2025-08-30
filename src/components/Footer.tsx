import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">B</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Boutique</h3>
                <p className="text-background/80">Shopping simple et accessible</p>
              </div>
            </div>
            <p className="text-background/80 max-w-md mb-6">
              Votre destination pour des produits de qualité à prix unique. 
              Une expérience d'achat simplifiée pour tous.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-background/90">+123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-background/90">contact@boutique.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-background/90">Dakar, Sénégal</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens utiles</h4>
            <div className="space-y-2">
              <div><a href="#" className="text-background/80 hover:text-background">À propos</a></div>
              <div><a href="#" className="text-background/80 hover:text-background">Livraison</a></div>
              <div><a href="#" className="text-background/80 hover:text-background">Retours</a></div>
              <div><a href="#" className="text-background/80 hover:text-background">Support</a></div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/60">
            © 2024 Boutique. Tous droits réservés. Site adapté à tous.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;