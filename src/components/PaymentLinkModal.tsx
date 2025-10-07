import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string | null;
}

export function PaymentLinkModal({ isOpen, onClose, paymentUrl }: PaymentLinkModalProps) {
  if (!isOpen || !paymentUrl) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-2xl font-bold mt-4">Votre commande est presque prête !</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground mt-2">
            Une dernière étape pour finaliser votre achat en toute sécurité.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-4 text-center">
          <p>
            Nous avons généré un lien de paiement sécurisé juste pour vous. Cliquez sur le bouton ci-dessous pour être redirigé vers la plateforme de paiement et valider votre commande.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Transaction protégée par MyCoolPay</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
            onClick={() => window.open(paymentUrl, '_blank')}
          >
            Finaliser mon paiement
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="outline" onClick={onClose}>
            Payer plus tard
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Si vous choisissez de payer plus tard, vous recevrez les instructions de paiement par SMS ou WhatsApp.
        </p>
      </DialogContent>
    </Dialog>
  );
}