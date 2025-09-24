import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Mock data to be used since the database is not available
const MOCK_PAGES = {
  about: { title: "À Propos de oneprice.shop", content: { description: "Bienvenue sur oneprice.shop, votre destination unique pour des produits innovants et de haute qualité...", team: "Notre équipe est composée de professionnels dévoués..." } },
  delivery: { title: "Politique de Livraison", content: { shipping_times: "5 à 7 jours ouvrables.", shipping_costs: "Gratuite pour les commandes de plus de 50€.", order_tracking: "Un email avec un numéro de suivi vous sera envoyé." } },
  returns: { title: "Politique de Retours", content: { return_conditions: "Vous disposez de 30 jours pour retourner un article.", return_procedure: "Veuillez contacter notre service client.", refunds: "Votre remboursement sera traité sous 5 à 10 jours." } },
  support: { title: "Contactez-nous", content: { email: "support@swiftappplan.com", phone: "+1 (234) 567-890" } },
  'privacy-policy': { title: 'Politique de Confidentialité', content: { introduction: 'Votre vie privée est importante pour nous. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations.', data_collection: 'Nous collectons des informations lorsque vous vous inscrivez sur notre site, passez une commande, vous abonnez à notre newsletter ou remplissez un formulaire.' } },
  'terms-of-service': { title: 'Conditions d\'Utilisation', content: { introduction: 'En accédant et en utilisant ce site web, vous acceptez d\'être lié par les présentes conditions d\'utilisation.', user_obligations: 'Vous vous engagez à ne pas utiliser ce site à des fins illégales ou interdites par les présentes conditions.' } },
};

export const usePageContent = (slug: string) => {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageContent = async () => {
      // Set loading to true at the beginning of the fetch
      setLoading(true);
      
      // Simulate an API call with a short delay
      setTimeout(() => {
        const data = MOCK_PAGES[slug];
        if (data) {
          setPage(data);
        }
        setLoading(false);
      }, 500);

      /*
      // --- REAL IMPLEMENTATION (to be used when DB is ready) ---
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching page content:', error);
          // Fallback to mock data in case of error
          setPage(MOCK_PAGES[slug]);
        } else {
          setPage(data);
        }
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        setPage(MOCK_PAGES[slug]);
      } finally {
        setLoading(false);
      }
      */
    };

    fetchPageContent();
  }, [slug]);

  return { page, loading };
};