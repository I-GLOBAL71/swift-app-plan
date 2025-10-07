import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedPaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string | null;
}

export function GeneratedPaymentLinkModal({ isOpen, onClose, paymentUrl }: GeneratedPaymentLinkModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !paymentUrl) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    toast({ title: "Succès", description: "Lien de paiement copié dans le presse-papiers." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lien de Paiement de Commande',
          text: 'Veuillez utiliser ce lien pour finaliser le paiement de votre commande.',
          url: paymentUrl,
        });
        toast({ title: "Succès", description: "Lien partagé." });
      } catch (error: any) {
        // AbortError is expected if the user cancels the share sheet.
        if (error.name === 'AbortError') {
          console.log('Share action was cancelled by the user.');
        } else {
          console.error('Error sharing:', error);
          toast({ title: "Erreur", description: "Le partage a échoué.", variant: "destructive" });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopy();
      toast({ title: "Partage non supporté", description: "Le lien a été copié. Vous pouvez le coller manuellement." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lien de Paiement Généré</DialogTitle>
          <DialogDescription>
            Partagez ce lien avec le client pour qu'il puisse finaliser son paiement en toute sécurité.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 my-4">
          <Input value={paymentUrl} readOnly className="flex-1" />
          <Button size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Partager le lien
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}