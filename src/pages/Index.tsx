import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StandardSection from "@/components/StandardSection";
import PremiumSection from "@/components/PremiumSection";
import DynamicSections from "@/components/DynamicSections";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <StandardSection />
        <PremiumSection />
        <DynamicSections />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
