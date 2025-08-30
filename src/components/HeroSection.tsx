import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-muted-foreground font-medium">Qualité garantie</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Shopping
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              Simple & Accessible
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Tous nos produits à prix unique de <strong className="text-primary">3000 FCFA</strong>. 
            Une expérience d'achat simplifiée pour tous.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="cta" size="xl" className="group">
              Découvrir nos produits
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Comment ça marche ?
            </Button>
          </div>
          
          <div className="mt-12 flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Produits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Clients satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24h</div>
              <div className="text-sm text-muted-foreground">Livraison</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;