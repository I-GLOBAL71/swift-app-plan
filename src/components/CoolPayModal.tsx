import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
  const [paymentLoadingMessage, setPaymentLoadingMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState<{ name: string; phone: string; email: string | null } | null>(null);
  const { toast } = useToast();

  const totalAmount = amount + shippingFee;

  useEffect(() => {
    const fetchOrderData = async () => {
      if (isOpen && orderId) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('customer_name, customer_phone, customer_email')
            .eq('id', orderId)
            .single();

          if (error) throw error;

          if (data) {
            setCustomer({
              name: data.customer_name,
              phone: data.customer_phone,
              email: data.customer_email,
            });
            setPhoneNumber(data.customer_phone); // Pre-fill phone number
          }
        } catch (error) {
          console.error('Error fetching order data:', error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les détails de la commande.",
            variant: "destructive",
          });
          onClose();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderData();
  }, [isOpen, orderId]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const handlePayment = async () => {
    if (!orderId || !customer) {
      toast({ title: "Erreur", description: "Données de commande invalides.", variant: "destructive" });
      return;
    }
    if (!phoneNumber) {
      toast({ title: "Erreur", description: "Veuillez entrer un numéro de téléphone.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setPaymentLoadingMessage('Initiation du paiement...');

    try {
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-mycoolpay-payment', {
        body: {
          amount: totalAmount,
          currency: 'XAF',
          description: `Commande ${orderId}`,
          sender: {
            name: customer.name,
            email: customer.email || 'noreply@example.com',
          },
          recipient: {
            name: customer.name,
            account_number: phoneNumber,
            bank_code: "CM_MOBILE_MONEY", // Example, should be dynamic if needed
            bank_name: "Mobile Money"
          },
          metadata: {
            order_id: orderId,
          },
          orderId: orderId,
        },
      });

      if (paymentError) throw paymentError;

      const transactionId = paymentData?.data?.transfer_id;
      if (!transactionId) {
        throw new Error("Réponse invalide de l'API de paiement.");
      }

      setPaymentLoadingMessage('Paiement initié. En attente de la confirmation du webhook...');
      
      // No popup, no polling. We just wait for the webhook to call onSuccess.
      // The parent component will listen for database changes.
      toast({
        title: "Paiement initié",
        description: "Veuillez confirmer le paiement sur votre téléphone. Vous serez notifié une fois le paiement confirmé.",
      });

      // We can call onSuccess immediately to update the UI to a "pending" state
      // The parent component should handle the final confirmation via webhook.
      onSuccess(transactionId);

    } catch (error: any) {
      const errorMessage = error.context?.error?.message || error.message || "Une erreur s'est produite lors de l'initiation du paiement.";
      console.error('Payment error:', error);
      toast({
        title: "Erreur de paiement",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose} className="w-11/12 sm:max-w-md" contentClassName="max-h-[90vh] overflow-y-auto" forceDialog>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paiement en ligne
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="bg-muted rounded-lg">
          <div className="flex justify-between font-medium mt-2 pt-2">
            <span>Total à payer :</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Numéro de téléphone de paiement *</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ex: 237678901234"
            className="mt-1"
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Utilisé pour le paiement Mobile Money.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {paymentLoadingMessage || 'Traitement...'}
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