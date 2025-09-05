import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CoolPayModal } from './CoolPayModal';
import { ShoppingCart, MapPin, CreditCard, Truck, Phone, Mail, User } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | string[];
  is_premium: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface City {
  id: string;
  name: string;
  region: string;
  shipping_fee: number;
  payment_required_before_shipping: boolean;
  delivery_days: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

type PaymentMethod = 'cash_on_delivery' | 'coolpay';

export function CheckoutModal({ isOpen, onClose, cartItems, onOrderComplete }: CheckoutModalProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [showCoolPayModal, setShowCoolPayModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCities();
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
      toast({
        title: "Erreur",
        description: "Impossible de charger les villes",
        variant: "destructive",
      });
    }
  };

  const selectedCityData = cities.find(c => c.id === selectedCity);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = selectedCityData?.shipping_fee || 0;
  const total = subtotal + shippingFee;

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const getImageUrl = (imageUrl: string | string[]) => {
    if (Array.isArray(imageUrl)) {
      return imageUrl[0] || '/placeholder.svg';
    }
    return imageUrl || '/placeholder.svg';
  };

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !selectedCity) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'coolpay') {
      // Ouvrir le modal CoolPay
      setShowCoolPayModal(true);
      return;
    }

    // Traitement pour paiement à la livraison
    setLoading(true);
    try {
        // Calculate expected delivery date
        const deliveryDays = selectedCityData?.delivery_days || 3;
        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + deliveryDays);

        const { data: orderResult, error: orderError } = await supabase
          .from('orders')
          .insert([{
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_email: customerInfo.email,
            total_amount: total,
            status: 'pending',
            city_id: selectedCity,
            expected_delivery_date: expectedDeliveryDate.toISOString(),
            payment_method: paymentMethod,
            notes: `Ville: ${selectedCityData?.name}, Paiement: À la livraison`
          }])
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Créer les articles de commande
      if (orderResult) {
        const orderItems = cartItems.map(item => ({
          order_id: orderResult.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Commande confirmée !",
        description: "Votre commande a été enregistrée avec succès",
      });

      // Redirect to order confirmation page
      window.location.href = `/order-confirmation?orderId=${orderResult.id}`;
      
      onOrderComplete();
      onClose();
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCoolPaySuccess = (transactionId: string, orderId?: string) => {
    toast({
      title: "Paiement réussi !",
      description: `Transaction: ${transactionId}`,
    });
    
    if (orderId) {
      window.location.href = `/order-confirmation?orderId=${orderId}`;
    }
    
    onOrderComplete();
    onClose();
  };

  // Vérifier si le paiement est obligatoire pour la ville sélectionnée
  const isPaymentRequired = selectedCityData?.payment_required_before_shipping || false;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Finaliser ma commande
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Résumé du panier */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Résumé de la commande</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      {item.is_premium && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Ex: 237678901234"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email (optionnel)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ville de livraison */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ville de livraison
                </h3>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{city.name} ({city.region})</span>
                          <span className="ml-4 text-muted-foreground">
                            {formatPrice(city.shipping_fee)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isPaymentRequired && selectedCity && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ Paiement obligatoire avant expédition pour cette ville
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Méthode de paiement */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Méthode de paiement
                </h3>
                <div className="space-y-2">
                  {!isPaymentRequired && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="cash_on_delivery"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="cash_on_delivery" className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Paiement à la livraison
                      </Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="coolpay"
                      name="payment_method"
                      value="coolpay"
                      checked={paymentMethod === 'coolpay' || isPaymentRequired}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      disabled={isPaymentRequired}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="coolpay" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Paiement en ligne (CoolPay)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total */}
            {selectedCity && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total :</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frais de livraison :</span>
                      <span>{formatPrice(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total :</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitOrder}
                disabled={loading || !selectedCity || !customerInfo.name || !customerInfo.phone}
                className="flex-1"
              >
                {loading ? 'Traitement...' : 'Confirmer la commande'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CoolPayModal
        isOpen={showCoolPayModal}
        onClose={() => setShowCoolPayModal(false)}
        amount={subtotal}
        onSuccess={handleCoolPaySuccess}
        orderData={{
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          city_id: selectedCity
        }}
      />
    </>
  );
}