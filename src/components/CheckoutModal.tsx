import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LygosPayModal } from './LygosPayModal';
import { PaymentLinkModal } from './PaymentLinkModal';
import { ShoppingCart, MapPin, CreditCard, Truck, Phone, Mail, User, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/contexts/SettingsContext';

interface Product {
  id:string;
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
  onOrderComplete: () => void;
}

export function CheckoutModal({ isOpen, onClose, onOrderComplete }: CheckoutModalProps) {
  const { cartItems, totalPrice, clearCart, removeFromCart } = useCart();
  const { paymentMethods } = useSettings();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [showLygosModal, setShowLygosModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedCityData = cities.find(c => c.id === selectedCity);
  const isPaymentRequired = selectedCityData?.payment_required_before_shipping || false;
  
  const onlinePaymentMethods = paymentMethods.filter(pm => pm.name.toLowerCase() !== 'cash on delivery');
  const defaultOnlineMethod = onlinePaymentMethods.length > 0 ? onlinePaymentMethods[0].name : '';

  const effectivePaymentMethod = isPaymentRequired
    ? (paymentMethod.toLowerCase() === 'cash on delivery' ? defaultOnlineMethod : paymentMethod)
    : paymentMethod;

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

  const shippingFee = selectedCityData?.shipping_fee || 0;
  const total = totalPrice + shippingFee;

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const getImageUrl = (imageUrl: string | string[]) => {
    if (Array.isArray(imageUrl)) {
      return imageUrl[0] || '/placeholder.svg';
    }
    return imageUrl || '/placeholder.svg';
  };

  const createOrder = async (status: 'pending' | 'pending_payment' = 'pending') => {
    if (!customerInfo.name || !customerInfo.phone || !selectedCity) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return null;
    }

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
        status: status,
        city_id: selectedCity,
        expected_delivery_date: expectedDeliveryDate.toISOString(),
        payment_method: effectivePaymentMethod,
        notes: `Ville: ${selectedCityData?.name}, Paiement: ${effectivePaymentMethod}`
      }])
      .select('id')
      .single();

    if (orderError) throw orderError;

    if (orderResult) {
      const orderItems = cartItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    }

    return orderResult.id;
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      // Si paiement en ligne est sélectionné OU requis pour cette ville
      if (effectivePaymentMethod.toLowerCase() !== 'cash on delivery') {
        const newOrderId = await createOrder('pending_payment');
        if (newOrderId) {
          setOrderId(newOrderId);
          // Generate payment link for any online method
          const { data, error } = await supabase.functions.invoke('generate-payment-link', {
            body: { orderId: newOrderId },
          });

          if (error) {
            throw new Error(`Erreur lors de la génération du lien de paiement: ${error.message}`);
          }

          setPaymentUrl(data.paymentUrl);
          setShowPaymentLinkModal(true);
          onClose(); // Close the checkout modal
        }
      } else { // Cash on Delivery
        const newOrderId = await createOrder('pending');
        if (newOrderId) {
          clearCart();
          toast({
            title: "Commande confirmée !",
            description: "Votre commande a été enregistrée. Paiement à la livraison.",
          });
          window.location.href = `/order-confirmation?orderId=${newOrderId}`;
          onOrderComplete();
          onClose();
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Erreur de commande",
        description: "Une erreur s'est produite lors de la création de votre commande.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      // Mettre à jour le statut de la commande à "confirmed" après paiement réussi
      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'confirmed'
          })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating order status:', error);
          throw error;
        }

        // Vider le panier seulement après paiement confirmé
        clearCart();
        
        toast({
          title: "Paiement réussi !",
          description: `Votre commande est confirmée. ID: ${transactionId}`,
        });
        
        window.location.href = `/order-confirmation?orderId=${orderId}`;
        onOrderComplete();
        onClose();
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Erreur de confirmation",
        description: "Le paiement a réussi mais la confirmation a échoué. Contactez le support.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <ResponsiveDialog open={isOpen} onOpenChange={onClose} className="w-11/12 sm:max-w-2xl" contentClassName="max-h-[90vh] overflow-y-auto">
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
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                {paymentMethods.map((method) => {
                  const isCashOnDelivery = method.name.toLowerCase() === 'cash on delivery';
                  if (isPaymentRequired && isCashOnDelivery) {
                    return null; // Hide cash on delivery if payment is required
                  }
                  return (
                    <div key={method.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={method.id}
                        name="payment_method"
                        value={method.name}
                        checked={effectivePaymentMethod === method.name}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={method.id} className="flex items-center gap-2">
                        {isCashOnDelivery ? <Truck className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        {method.name}
                      </Label>
                    </div>
                  );
                })}
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
                    <span>{formatPrice(totalPrice)}</span>
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
              disabled={loading || showLygosModal || !selectedCity || !customerInfo.name || !customerInfo.phone}
              className="flex-1"
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      <PaymentLinkModal
        isOpen={showPaymentLinkModal}
        onClose={() => {
          setShowPaymentLinkModal(false);
          // Redirect to order confirmation page after closing the final modal
          if (orderId) {
            window.location.href = `/order-confirmation?orderId=${orderId}`;
          }
        }}
        paymentUrl={paymentUrl}
      />

      <LygosPayModal
        isOpen={showLygosModal}
        onClose={() => {
          // Empêcher la fermeture si le paiement est requis pour cette ville
          if (isPaymentRequired) {
            toast({
              title: "Paiement requis",
              description: "Vous devez effectuer le paiement pour finaliser votre commande.",
              variant: "destructive",
            });
            return;
          }
          setShowLygosModal(false);
          setOrderId(null);
        }}
        amount={totalPrice}
        shippingFee={shippingFee}
        onSuccess={handlePaymentSuccess}
        orderId={orderId}
      />
    </>
  );
}