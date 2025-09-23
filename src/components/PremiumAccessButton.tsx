import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PremiumAccessButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/premium");
  };

  return (
    <section className="py-16 bg-gradient-to-br from-premium/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-premium/10 via-premium/5 to-accent/10 border-2 border-premium/20 shadow-premium">
          {/* Decorative elements */}
          <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-premium rounded-full opacity-30 blur-xl animate-pulse-soft"></div>
          <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-primary rounded-full opacity-20 blur-lg animate-float"></div>
          
          <div className="relative z-10 p-8 md:p-12 text-center">
            {/* Icon and title */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center shadow-premium">
                  <Crown className="w-8 h-8 text-premium-foreground" />
                </div>
                <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-pulse-soft" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                Nos Gadgets Premium
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Découvrez nos gadgets exceptionnels, une sélection de produits uniques dont les prix dépassent 3,000 FCFA. Profitez des prix les plus compétitifs du marché.
            </p>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-premium">
                <Star className="w-5 h-5" />
                <span className="font-medium">Gadgets Exceptionnels</span>
              </div>
              <div className="flex items-center gap-2 text-premium">
                <Crown className="w-5 h-5" />
                <span className="font-medium">Prix {'>'} 3,000 FCFA</span>
              </div>
              <div className="flex items-center gap-2 text-premium">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Meilleurs Prix Garantis</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleClick}
              className="group bg-gradient-premium hover:shadow-premium border-0 text-premium-foreground font-bold transition-all duration-300 hover:scale-105 w-full sm:w-auto h-16 rounded-lg px-8 sm:px-12 text-base flex items-center justify-center gap-3"
            >
              <Crown className="w-6 h-6" />
              <span>Explorer nos Gadgets Premium</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Sub text */}
            <p className="text-sm text-muted-foreground mt-4 opacity-80">
              Accès exclusif à nos meilleurs gadgets
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumAccessButton;