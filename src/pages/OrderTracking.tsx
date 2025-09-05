import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, MapPin, Calendar, Clock, CheckCircle, Truck, ArrowLeft, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_method: string;
  expected_delivery_date: string;
  created_at: string;
  updated_at: string;
  city: {
    name: string;
    region: string;
    delivery_days: number;
  };
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
      image_url: any;
    };
  }[];
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      setSearchQuery(orderId);
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          city:cameroon_cities(name, region, delivery_days),
          order_items(
            id,
            quantity,
            price,
            product:products(title, image_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast({
        title: "Erreur",
        description: "Commande introuvable",
        variant: "destructive",
      });
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/order-tracking?orderId=${searchQuery.trim()}`);
      loadOrder(searchQuery.trim());
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const getStatusSteps = (currentStatus: string, expectedDate: string) => {
    const steps = [
      { key: 'pending', label: 'Commande reçue', icon: Package },
      { key: 'confirmed', label: 'Confirmée', icon: CheckCircle },
      { key: 'shipped', label: 'Expédiée', icon: Truck },
      { key: 'delivered', label: 'Livrée', icon: CheckCircle }
    ];

    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
      upcoming: index > currentIndex
    }));
  };

  const getRemainingTime = (expectedDate: string) => {
    const now = new Date();
    const delivery = new Date(expectedDate);
    const diff = delivery.getTime() - now.getTime();
    
    if (diff <= 0) {
      return "Livraison prévue dépassée";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''} et ${hours}h restant${hours > 1 ? 's' : ''}`;
    }
    return `${hours}h restant${hours > 1 ? 's' : ''}`;
  };

  const getDeliveryProgress = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'confirmed': return 50;
      case 'shipped': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Suivi de commande
          </h1>
          
          {/* Search */}
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">ID de commande</Label>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Saisissez votre ID de commande"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Statut de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${getDeliveryProgress(order.status)}%` }}
                        />
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                      {getStatusSteps(order.status, order.expected_delivery_date).map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <div key={step.key} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.completed 
                                ? 'bg-primary text-primary-foreground' 
                                : step.current
                                ? 'bg-primary/20 text-primary border-2 border-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                              </p>
                              {step.current && (
                                <p className="text-sm text-primary">En cours</p>
                              )}
                            </div>
                            {step.completed && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <img
                          src={Array.isArray(item.product.image_url) ? item.product.image_url[0] : item.product.image_url || '/placeholder.svg'}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product.title}</p>
                          <p className="text-sm text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Temps restant</p>
                    <p className="font-bold text-lg text-primary">
                      {getRemainingTime(order.expected_delivery_date)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.city.name}</p>
                      <p className="text-sm text-muted-foreground">{order.city.region}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date prévue</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.expected_delivery_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Commande</span>
                    <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold">{formatPrice(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paiement</span>
                    <span>{order.payment_method === 'cash_on_delivery' ? 'À la livraison' : 'CoolPay'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </div>
          </div>
        )}

        {!loading && !order && searchQuery && (
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucune commande trouvée avec cet ID
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}