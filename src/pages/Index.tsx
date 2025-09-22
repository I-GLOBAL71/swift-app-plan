import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import StandardSection from "@/components/StandardSection";
import PremiumAccessButton from "@/components/PremiumAccessButton";
import DynamicSections from "@/components/DynamicSections";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <section id="products">
          <StandardSection />
        </section>
        <PremiumAccessButton />
        <DynamicSections />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
