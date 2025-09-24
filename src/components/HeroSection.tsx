import { useSettings } from "@/contexts/SettingsContext";
import HeroCarousel from "./HeroCarousel";
import HeroProductGrid from "./HeroProductGrid";
import { Skeleton } from "./ui/skeleton";

const HeroSection = () => {
  const { heroStyle, loading } = useSettings();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[70vh] w-full" />
      </div>
    );
  }

  if (heroStyle === 'product_grid') {
    return <HeroProductGrid />;
  }
  
  return <HeroCarousel />;
};

export default HeroSection;