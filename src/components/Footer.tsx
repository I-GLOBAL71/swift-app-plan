import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter as XIcon, LucideProps } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// A simple component for the TikTok icon
const TikTokIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 12a4 4 0 1 0 4 4V8.5a4.5 4.5 0 1 1 4.5 4.5" />
  </svg>
);


const socialIconMap: { [key: string]: React.ComponentType<LucideProps> } = {
  facebook: Facebook,
  instagram: Instagram,
  x: XIcon,
  tiktok: TikTokIcon,
};


const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<Tables<'social_links'>[]>([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .not('url', 'is', null); // Only fetch links that have a URL

      if (error) {
        console.error("Error fetching social links:", error);
      } else {
        setSocialLinks(data || []);
      }
    };

    fetchSocialLinks();
  }, []);

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
              {socialLinks.map(link => {
                const Icon = socialIconMap[link.name];
                if (!Icon || !link.url) return null;
                return (
                  <a href={link.url} key={link.id} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                      <Icon className="w-5 h-5" />
                    </Button>
                  </a>
                );
              })}
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
              <div><Link to="/about" className="text-background/80 hover:text-background">À propos</Link></div>
              <div><Link to="/delivery" className="text-background/80 hover:text-background">Livraison</Link></div>
              <div><Link to="/returns" className="text-background/80 hover:text-background">Retours</Link></div>
              <div><Link to="/support" className="text-background/80 hover:text-background">Support</Link></div>
              <div><Link to="/privacy-policy" className="text-background/80 hover:text-background">Politique de confidentialité</Link></div>
              <div><Link to="/terms-of-service" className="text-background/80 hover:text-background">Conditions d'utilisation</Link></div>
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