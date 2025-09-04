import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, Phone } from 'lucide-react';

interface CoolPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (transactionId: string) => void;
  orderData?: {
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    city_id: string;
  };
}

interface City {
  id: string;
  name: string;
  shipping_fee: number;
  payment_required_before_shipping: boolean;
}

export function CoolPayModal({ isOpen, onClose, amount, onSuccess, orderData }: CoolPayModalProps) {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [coolPaySettings, setCoolPaySettings] = useState<{
    publicKey: string;
    environment: string;
  }>({ publicKey: '', environment: 'sandbox' });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCities();
      loadCoolPaySettings();
    }
  }, [isOpen]);

  const loadCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cameroon_cities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

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

  const calculateTotal = () => {
    const selectedCityData = cities.find(c => c.id === selectedCity);
    const shippingFee = selectedCityData?.shipping_fee || 0;
    return amount + shippingFee;
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('fr-FR') + ' XAF';
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

    if (!selectedCity) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre ville",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate CoolPay API call
      // In a real implementation, you would integrate with the actual CoolPay API
      const paymentData = {
        amount: calculateTotal(),
        currency: 'XAF',
        payment_method: paymentMethod,
        phone_number: paymentMethod === 'mobile' ? phoneNumber : undefined,
        public_key: coolPaySettings.publicKey,
        environment: coolPaySettings.environment,
        metadata: {
          order_data: orderData,
          city_id: selectedCity
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll simulate a successful payment
      const mockTransactionId = `coolpay_${Date.now()}`;

      // Create order in database if orderData is provided
      if (orderData) {
        const selectedCityData = cities.find(c => c.id === selectedCity);
        
        const { data: orderResult, error: orderError } = await supabase
          .from('orders')
          .insert([{
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone,
            customer_email: orderData.customer_email,
            total_amount: calculateTotal(),
            status: 'paid',
            notes: `Paiement CoolPay: ${mockTransactionId}, Ville: ${selectedCityData?.name}`
          }])
          .select('id')
          .single();

        if (orderError) throw orderError;

        // Create order items
        if (orderResult) {
          const orderItems = orderData.items.map(item => ({
            order_id: orderResult.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) throw itemsError;
        }
      }

      toast({
        title: "Paiement réussi !",
        description: "Votre commande a été confirmée",
      });

      onSuccess(mockTransactionId);
      onClose();
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

  const selectedCityData = cities.find(c => c.id === selectedCity);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Paiement CoolPay
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="city">Ville de livraison *</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre ville" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {formatPrice(city.shipping_fee)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCity && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Sous-total :</span>
                <span>{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frais de livraison :</span>
                <span>{formatPrice(selectedCityData?.shipping_fee || 0)}</span>
              </div>
              <div className="flex justify-between font-medium border-t mt-2 pt-2">
                <span>Total :</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          )}

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
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Carte bancaire
              </Button>
            </div>
          </div>

          {paymentMethod === 'mobile' && (
            <div>
              <Label htmlFor="phone">Numéro de téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 237678901234"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Format international avec indicatif pays (237 pour le Cameroun)
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handlePayment}
              disabled={loading || !selectedCity}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                `Payer ${selectedCity ? formatPrice(calculateTotal()) : ''}`
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Paiement sécurisé par CoolPay. Vos données sont protégées.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}