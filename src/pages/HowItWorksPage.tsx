import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingCart, Truck, Smile } from "lucide-react";

const HowItWorksPage = () => {
  const steps = [
    {
      icon: <ShoppingCart className="w-12 h-12 text-primary" />,
      title: "1. Parcourez et Choisissez",
      description: "Explorez notre vaste catalogue de produits et ajoutez vos articles préférés au panier. Utilisez nos filtres pour affiner votre recherche.",
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-primary" />,
      title: "2. Validez Votre Commande",
      description: "Une fois votre sélection terminée, rendez-vous dans votre panier pour vérifier votre commande. Appliquez des codes promotionnels si vous en avez.",
    },
    {
      icon: <Truck className="w-12 h-12 text-primary" />,
      title: "3. Livraison Rapide et Fiable",
      description: "Nous préparons votre commande avec soin et l'expédions dans les plus brefs délais. Suivez votre colis en temps réel jusqu'à votre porte.",
    },
    {
      icon: <Smile className="w-12 h-12 text-primary" />,
      title: "4. Profitez de Vos Achats",
      description: "Recevez vos produits et profitez de la qualité oneprice.shop. Votre satisfaction est notre priorité absolue.",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <header className="relative h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 opacity-90"></div>
        <div className="relative z-10 text-center text-primary-foreground">
          <h1 className="text-4xl md:text-6xl font-bold">Comment Ça Marche ?</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">Votre expérience d'achat, simplifiée en quatre étapes faciles.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center border-2 border-transparent hover:border-primary hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-col items-center gap-4">
                {step.icon}
                <CardTitle className="text-2xl font-semibold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <section className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
                Découvrez des produits incroyables et profitez d'une expérience d'achat fluide et sécurisée. Notre équipe est là pour vous accompagner à chaque étape.
            </p>
            <a href="/products" className="inline-block bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">
                Explorer les produits
            </a>
        </section>
      </main>
    </div>
  );
};

export default HowItWorksPage;