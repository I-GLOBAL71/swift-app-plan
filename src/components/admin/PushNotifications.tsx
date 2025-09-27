import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PushNotifications = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!title || !body) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le titre et le corps de la notification.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: { title, body, imageUrl },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Succès',
        description: 'Notification envoyée avec succès.',
      });
      setTitle('');
      setBody('');
      setImageUrl('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: `Échec de l'envoi de la notification: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyer des notifications push</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Titre de la notification"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Corps de la notification"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Input
          placeholder="URL de l'image (optionnel)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Button onClick={handleSendNotification} disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer la notification'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PushNotifications;