import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, Phone } from 'lucide-react';

interface CoolPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // This is sub-total
  shippingFee: number;
  onSuccess: (transactionId: string) => void;
  orderId: string | null;
}

export function CoolPayModal({ isOpen, onClose, amount, shippingFee, onSuccess, orderId }: CoolPayModalProps) {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [coolPaySettings, setCoolPaySettings] = useState<{
    publicKey: string;
    environment: string;
  }>({ publicKey: '', environment: 'sandbox' });
  const { toast } = useToast();

  const totalAmount = amount + shippingFee;

  useEffect(() => {
    if (isOpen) {
      loadCoolPaySettings();
      // Pre-fill phone number from checkout form
      if (orderId) {
        // You can fetch customer phone from order if needed, but for now we remove the dependency on orderData
      }
    }
  }, [isOpen, orderId]);

  const loadCoolPaySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['coolpay_public_key', 'coolpay_environment']);

      if (error) throw error;

      const settings = data?.reduce((acc, setting) => {
        if (setting.key === 'coolpay_public_key') acc.publicKey = setting.value || '';
        if (setting.key === 'coolpay_environment') acc.environment = setting.value || 'sandbox';
        return acc;
      }, { publicKey: '', environment: 'sandbox' });

      setCoolPaySettings(settings || { publicKey: '', environment: 'sandbox' });
    } catch (error) {
      console.error('Error loading CoolPay settings:', error);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const handlePayment = async () => {
    if (!coolPaySettings.publicKey) {
      toast({
        title: "Erreur",
        description: "CoolPay n'est pas configuré. Contactez l'administrateur.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'mobile' && !phoneNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate CoolPay API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTransactionId = `coolpay_${Date.now()}`;

      if (orderId) {
        // Update order status to 'paid'
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            notes: `Paiement CoolPay réussi: ${mockTransactionId}`
          })
          .eq('id', orderId);

        if (updateError) throw updateError;

        toast({
          title: "Paiement réussi !",
          description: "Votre commande a été confirmée",
        });
  
        onSuccess(mockTransactionId);
        onClose();
      } else {
        toast({
          title: "Erreur de paiement",
          description: "ID de commande manquant.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur s'est produite lors du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose} className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paiement en ligne
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Sous-total :</span>
            <span>{formatPrice(amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Frais de livraison :</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between font-medium border-t mt-2 pt-2">
            <span>Total à payer :</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>

        <div>
          <Label>Méthode de paiement</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('mobile')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Mobile Money
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('card')}
              className="flex-1"
              disabled
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Carte bancaire (Bientôt)
            </Button>
          </div>
        </div>

        {paymentMethod === 'mobile' && (
          <div>
            <Label htmlFor="phone">Numéro de téléphone de paiement *</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex: 237678901234"
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Utilisé pour le paiement Mobile Money.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              `Payer ${formatPrice(totalAmount)}`
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Paiement sécurisé par CoolPay.
        </p>
      </div>
    </ResponsiveDialog>
  );
}