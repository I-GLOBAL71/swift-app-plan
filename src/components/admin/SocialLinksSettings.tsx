import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface SocialLink {
  id: string | number;
  platform: string;
  url: string | null;
}

const socialMediaPlatforms = ['facebook', 'instagram', 'x', 'tiktok'];

export default function SocialLinksSettings() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_links')
        .select('id, platform, url')
        .in('platform', socialMediaPlatforms)
        .order('platform');

      if (error) {
        toast({
          title: 'Erreur',
          description: "Impossible de charger les liens des réseaux sociaux.",
          variant: 'destructive',
        });
        console.error(error);
      } else {
        const existingLinks = (data || []) as SocialLink[];
        const allLinks: SocialLink[] = socialMediaPlatforms.map(platform => {
          const existing = existingLinks.find(link => link.platform === platform);
          return existing || { id: `${Date.now()}-${platform}`, platform, url: null };
        });
        setSocialLinks(allLinks);
      }
      setLoading(false);
    };

    fetchSocialLinks();
  }, []);

  const handleInputChange = (id: string | number, value: string) => {
    setSocialLinks(prevLinks =>
      prevLinks.map(link => (link.id === id ? { ...link, url: value } : link))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const upsertPromises = socialLinks.map(link => {
      return supabase.from('social_links').upsert({
        platform: link.platform,
        url: link.url || null,
      }, { onConflict: 'platform' });
    });

    const results = await Promise.all(upsertPromises);

    const hasError = results.some(res => res.error);

    if (hasError) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de la mise à jour des liens.",
        variant: 'destructive',
      });
      results.forEach(res => {
        if (res.error) console.error('Error updating social link:', res.error);
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Les liens des réseaux sociaux ont été mis à jour.',
      });
    }
    setLoading(false);
  };

  if (loading && !socialLinks.length) {
    return <div>Chargement...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {socialLinks.map(link => (
        <div key={link.id} className="space-y-2">
          <Label htmlFor={link.platform} className="capitalize">{link.platform}</Label>
          <Input
            id={link.platform}
            type="url"
            value={link.url || ''}
            onChange={e => handleInputChange(link.id, e.target.value)}
            placeholder={`https://www.${link.platform}.com/votre-page`}
          />
        </div>
      ))}
      <Button type="submit" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </Button>
    </form>
  );
}