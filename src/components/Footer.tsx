import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter as XIcon, LucideProps } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SocialLink } from "@/lib/types";

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

type PageLink = {
  slug: string;
  title: string;
};

type FooterData = {
  pages: PageLink[] | null;
  supportContact: {
    email: string;
    phone: string;
  };
};


const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const { data: footerData, isLoading } = useQuery<FooterData, Error>({
    queryKey: ['footerData'],
    queryFn: async (): Promise<FooterData> => {
      const pagesQuery: any = supabase
        .from('pages')
        .select('slug, title')
        .eq('show_in_footer', true);

      const supportQuery: any = supabase
        .from('pages')
        .select('content')
        .eq('slug', 'support')
        .single();

      const [pagesResult, supportResult] = await Promise.all([pagesQuery, supportQuery]);

      if (pagesResult.error) {
        console.error("Error fetching pages:", pagesResult.error);
        throw pagesResult.error;
      }

      const pages = pagesResult.data as PageLink[] | null;
      let supportContact = { email: 'contact@oneprice.shop', phone: '+123 456 789' };

      if (supportResult.error) {
        console.error("Error fetching support contact:", supportResult.error);
      } else if (supportResult.data && typeof supportResult.data.content === 'object') {
        supportContact = supportResult.data.content as { email: string; phone: string };
      }

      return { pages, supportContact };
    },
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data, error } = await supabase
        .from('social_links')
        .select('id, platform, url')
        .not('url', 'is', null);

      if (error) {
        console.error("Error fetching social links:", error);
      } else {
        setSocialLinks((data || []).map(link => ({
          id: link.id,
          platform: link.platform,
          url: link.url
        })) as SocialLink[]);
      }
    };

    fetchSocialLinks();
  }, []);

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex justify-center md:justify-start items-center space-x-2 mb-4">
              <img src="/logo.png" alt="oneprice.shop logo" className="h-12 sm:h-14 w-auto object-contain" />
            </div>
            <p className="text-background/80 max-w-md mb-6 mx-auto md:mx-0">
              Votre destination pour des produits de qualité à prix unique.
              Une expérience d'achat simplifiée pour tous.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              {socialLinks.map(link => {
                const Icon = socialIconMap[link.platform];
                if (!Icon || !link.url) return null;
                return (
                  <a href={link.url} key={link.id} target="_blank" rel="noopener noreferrer" aria-label={link.platform}>
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
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-background/90">{footerData?.supportContact?.phone || '...'}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-background/90">{footerData?.supportContact?.email || '...'}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-background/90">Douala, Cameroun</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens utiles</h4>
            <div className="space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto md:mx-0"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto md:mx-0"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto md:mx-0"></div>
                </div>
              ) : (
                footerData?.pages?.map(page => (
                  <div key={page.slug}>
                    <Link to={`/${page.slug}`} className="text-background/80 hover:text-background">
                      {page.title}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/60">
            © 2024 oneprice.shop. Tous droits réservés. Site adapté à tous.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;