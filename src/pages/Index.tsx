import HeroCarousel from "@/components/HeroCarousel";
import StandardSection from "@/components/StandardSection";
import PremiumAccessButton from "@/components/PremiumAccessButton";
import DynamicSections from "@/components/DynamicSections";

const Index = () => {
  return (
    <>
      <HeroCarousel />
      <section id="products">
        <StandardSection />
      </section>
      <PremiumAccessButton />
      <DynamicSections />
    </>
  );
};

export default Index;
