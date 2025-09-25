import React, { useState, useEffect } from 'react';
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LygosPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  shippingFee: number;
  onSuccess: (transactionId: string) => void;
  orderId: string | null;
}

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export function LygosPayModal({ 
  isOpen, 
  onClose, 
  amount, 
  shippingFee, 
  onSuccess, 
  orderId 
}: LygosPayModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { toast } = useToast();

  const totalAmount = amount + shippingFee;

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const createPayment = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const baseUrl = window.location.origin;
      
      const response = await supabase.functions.invoke('create-lygos-payment', {
        body: {
          amount: totalAmount,
          shop_name: "Ma Boutique",
          message: `Commande #${orderId}`,
          success_url: `${baseUrl}/order-confirmation?orderId=${orderId}&payment=success`,
          failure_url: `${baseUrl}/order-confirmation?orderId=${orderId}&payment=failed`,
          order_id: orderId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { data } = response;
      
      if (data.success) {
        setPaymentUrl(data.payment_url);
        setPaymentStatus('processing');
        toast({
          title: "Lien de paiement créé",
          description: "Cliquez sur le lien pour effectuer votre paiement",
        });
      } else {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible de créer le lien de paiement",
        variant: "destructive",
      });
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId) return;

    setCheckingStatus(true);
    try {
      const response = await supabase.functions.invoke('check-lygos-payment', {
        body: { order_id: orderId }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { data } = response;
      
      if (data.success) {
        const status = data.status;
        if (status === 'completed' || status === 'success') {
          setPaymentStatus('completed');
          onSuccess(orderId);
        } else if (status === 'failed' || status === 'cancelled') {
          setPaymentStatus('failed');
          toast({
            title: "Paiement échoué",
            description: "Le paiement n'a pas pu être traité",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le statut du paiement",
        variant: "destructive",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId && !paymentUrl) {
      createPayment();
    }
  }, [isOpen, orderId]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <CreditCard className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'Paiement réussi';
      case 'failed':
        return 'Paiement échoué';
      case 'cancelled':
        return 'Paiement annulé';
      case 'processing':
        return 'En attente du paiement';
      default:
        return 'Initialisation du paiement';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      case 'processing':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paiement Lygos Pay
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Résumé du montant */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total :</span>
                <span>{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frais de livraison :</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total à payer :</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statut du paiement */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <p className="font-medium">{getStatusText()}</p>
                  <p className="text-sm text-muted-foreground">
                    Commande #{orderId}
                  </p>
                </div>
              </div>
              <Badge variant={getStatusColor() as any}>
                {paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actions selon le statut */}
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Création du lien de paiement...</span>
            </div>
          )}

          {paymentUrl && paymentStatus === 'processing' && (
            <div className="space-y-3">
              <Button
                onClick={() => window.open(paymentUrl, '_blank')}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir la page de paiement
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Cliquez sur le bouton ci-dessus pour effectuer votre paiement sur la plateforme Lygos Pay
              </p>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <Button
              onClick={checkPaymentStatus}
              disabled={checkingStatus}
              variant="outline"
              className="w-full"
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Vérification...
                </>
              ) : (
                'Vérifier le statut du paiement'
              )}
            </Button>
          )}

          {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
            <Button
              onClick={createPayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                'Réessayer le paiement'
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
            disabled={paymentStatus === 'completed'}
          >
            {paymentStatus === 'completed' ? 'Fermer' : 'Annuler'}
          </Button>
        </div>

        {paymentStatus === 'processing' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Instructions de paiement :</p>
                  <ul className="mt-2 space-y-1 text-blue-800">
                    <li>• Cliquez sur "Ouvrir la page de paiement"</li>
                    <li>• Effectuez votre paiement sur la plateforme Lygos</li>
                    <li>• Revenez ici et cliquez sur "Vérifier le statut"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveDialog>
  );
}