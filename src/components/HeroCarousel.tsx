import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { HeroSlide } from "@/lib/types";

const HeroCarousel = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isAutoPlaying]);

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSlides((data || []) as HeroSlide[]);
    } catch (error) {
      console.error("Error loading hero slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleButtonClick = (link: string) => {
    if (link.startsWith('#')) {
      const element = document.querySelector(link);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else if (link.startsWith('/')) {
      navigate(link);
    } else {
      window.open(link, '_blank');
    }
  };

  if (loading) {
    return (
      <section className="relative min-h-[70vh] flex items-center bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="text-xl text-primary-foreground">Chargement...</div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[90vh] sm:min-h-[70vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${currentSlideData.image_url})`,
          transform: `scale(1.05)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-background/40"></div>
      </div>
      
      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-background/50 border-primary/20 hover:bg-primary/10"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-background/50 border-primary/20 hover:bg-primary/10"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Auto-play Control */}
      {slides.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 z-20 bg-background/50 border-primary/20"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        >
          <Play className={`w-4 h-4 transition-transform ${isAutoPlaying ? 'scale-110' : 'scale-100'}`} />
          {isAutoPlaying ? 'Pause' : 'Play'}
        </Button>
      )}
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-4 animate-fade-in">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-muted-foreground font-medium">Qualité garantie</span>
          </div>
          
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            {currentSlideData.title}
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              {currentSlideData.subtitle}
            </span>
          </h1>
          
          <p
            className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            Découvrez nos produits de qualité
          </p>
          
          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <Button
              variant="cta"
              size="lg"
              className="group w-full sm:w-auto"
              onClick={() => handleButtonClick(currentSlideData.link)}
            >
              Découvrir
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/how-it-works')}>
              Comment ça marche ?
            </Button>
          </div>
          
          <div
            className="mt-12 flex items-center justify-center sm:justify-start gap-4 sm:gap-8 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Produits</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Clients satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">24h</div>
              <div className="text-sm text-muted-foreground">Livraison</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-primary scale-125'
                  : 'bg-background/50 hover:bg-background/70'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;