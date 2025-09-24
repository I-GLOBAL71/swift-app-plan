import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type PageSlug = 'about' | 'delivery' | 'returns' | 'support' | 'privacy-policy' | 'terms-of-service';

interface PageContent {
  [key: string]: any;
}

interface Page {
  slug: PageSlug;
  title: string;
  content: PageContent;
  show_in_footer: boolean;
}

const pageConfig: Record<PageSlug, { title: string; fields: { id: string; label: string; type: 'input' | 'textarea'; rows?: number }[] }> = {
  'about': {
    title: 'À Propos',
    fields: [
      { id: 'description', label: 'Description', type: 'textarea', rows: 5 },
      { id: 'team', label: 'Équipe', type: 'textarea', rows: 5 },
    ]
  },
  'delivery': {
    title: 'Livraison',
    fields: [
      { id: 'shipping_times', label: 'Délais de Livraison', type: 'input' },
      { id: 'shipping_costs', label: 'Frais de Livraison', type: 'input' },
      { id: 'order_tracking', label: 'Suivi de Commande', type: 'input' },
    ]
  },
  'returns': {
    title: 'Retours',
    fields: [
      { id: 'return_conditions', label: 'Conditions de Retour', type: 'textarea', rows: 4 },
      { id: 'return_procedure', label: 'Procédure de Retour', type: 'textarea', rows: 4 },
      { id: 'refunds', label: 'Remboursements', type: 'textarea', rows: 4 },
    ]
  },
  'support': {
    title: 'Support',
    fields: [
      { id: 'email', label: 'Email', type: 'input' },
      { id: 'phone', label: 'Téléphone', type: 'input' },
    ]
  },
  'privacy-policy': {
    title: 'Politique de Confidentialité',
    fields: [
      { id: 'introduction', label: 'Introduction', type: 'textarea', rows: 5 },
      { id: 'data_collection', label: 'Collecte des données', type: 'textarea', rows: 5 },
    ]
  },
  'terms-of-service': {
    title: "Conditions Générales d'Utilisation",
    fields: [
      { id: 'introduction', label: 'Introduction', type: 'textarea', rows: 5 },
      { id: 'user_obligations', label: "Obligations de l'utilisateur", type: 'textarea', rows: 5 },
    ]
  }
};

const fetchPages = async (): Promise<Record<PageSlug, Page>> => {
  const { data, error } = await supabase.from("pages").select("*");
  if (error) throw new Error(error.message);

  const pagesBySlug = (data as unknown as Page[]).reduce((acc, page) => {
    acc[page.slug] = page;
    return acc;
  }, {} as Record<PageSlug, Page>);

  return pagesBySlug;
};

const PagesManagement = () => {
  const queryClient = useQueryClient();
  const { data: initialPages, isLoading, isError } = useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages,
  });

  const [pages, setPages] = useState<Record<PageSlug, Page> | null>(null);

  useEffect(() => {
    if (initialPages) {
      const pageSlugs = Object.keys(pageConfig) as PageSlug[];
      
      const allPages = pageSlugs.reduce((acc, slug) => {
        const dbPage = initialPages[slug];
        acc[slug] = {
          slug: slug,
          title: dbPage?.title || pageConfig[slug].title,
          content: dbPage?.content || {},
          show_in_footer: dbPage?.show_in_footer ?? true,
        };
        return acc;
      }, {} as Record<PageSlug, Page>);

      setPages(allPages);
    }
  }, [initialPages]);

  const mutation = useMutation({
    mutationFn: async ({ slug, title, content, show_in_footer }: { slug: PageSlug, title: string, content: PageContent, show_in_footer: boolean }) => {
      const { error } = await supabase
        .from("pages")
        .upsert({ slug, title, content, show_in_footer });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['footerData'] });
      toast.success(`La page "${variables.title}" a été mise à jour.`);
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    },
  });

  const handleInputChange = (page: PageSlug, field: string, value: string) => {
    if (!pages) return;
    setPages(prev => ({
      ...prev!,
      [page]: {
        ...prev![page],
        content: { ...prev![page].content, [field]: value }
      }
    }));
  };

  const handleSwitchChange = (page: PageSlug, checked: boolean) => {
    if (!pages) return;
    setPages(prev => ({
      ...prev!,
      [page]: {
        ...prev![page],
        show_in_footer: checked,
      }
    }));
  };

  const handleSave = (page: PageSlug) => {
    if (!pages || !pages[page]) return;
    const { title, content, show_in_footer } = pages[page];
    mutation.mutate({ slug: page, title, content, show_in_footer });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <div className="space-y-4 mt-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !pages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Erreur lors du chargement des pages. Veuillez réessayer.</p>
        </CardContent>
      </Card>
    );
  }

  const pageSlugs = Object.keys(pageConfig) as PageSlug[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={pageSlugs[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            {pageSlugs.map(slug => (
              <TabsTrigger key={slug} value={slug}>
                {pageConfig[slug].title === "Conditions Générales d'Utilisation" ? "CGU" : 
                 pageConfig[slug].title === "Politique de Confidentialité" ? "Confidentialité" :
                 pageConfig[slug].title}
              </TabsTrigger>
            ))}
          </TabsList>

          {pageSlugs.map(slug => (
            <TabsContent key={slug} value={slug} className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{pages?.[slug]?.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`show-in-footer-${slug}`}
                      checked={pages?.[slug]?.show_in_footer}
                      onCheckedChange={(checked) => handleSwitchChange(slug, checked)}
                    />
                    <Label htmlFor={`show-in-footer-${slug}`}>Afficher dans le footer</Label>
                  </div>
                </div>

                {pageConfig[slug].fields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`${slug}-${field.id}`}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={`${slug}-${field.id}`}
                        value={pages?.[slug]?.content?.[field.id] || ''}
                        onChange={(e) => handleInputChange(slug, field.id, e.target.value)}
                        rows={field.rows || 5}
                      />
                    ) : (
                      <Input
                        id={`${slug}-${field.id}`}
                        value={pages?.[slug]?.content?.[field.id] || ''}
                        onChange={(e) => handleInputChange(slug, field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                
                <Button onClick={() => handleSave(slug)} disabled={mutation.isPending}>
                  {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PagesManagement;