import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Phone, Mail, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  status: string;
  notes: string;
  payment_method: string;
  expected_delivery_date: string;
  created_at: string;
  updated_at: string;
  city: {
    id: string;
    name: string;
    region: string;
    delivery_days: number;
  } | null;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      is_premium: boolean;
    };
  }[];
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          city:cameroon_cities(id, name, region, delivery_days),
          order_items (
            id,
            quantity,
            price,
            product:products (id, title, is_premium)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      
      toast.success("Statut de la commande mis à jour");
      loadOrders();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };

    const statusLabels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    
    return (
      <Badge className={`text-white ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const getDeliveryCountdown = (expectedDate: string, status: string) => {
    if (status === 'delivered' || status === 'cancelled') return null;
    
    const now = new Date();
    const delivery = new Date(expectedDate);
    const diff = delivery.getTime() - now.getTime();
    
    if (diff <= 0) {
      return <span className="text-red-500 font-medium">Retard de livraison</span>;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return <span className="text-orange-500 font-medium">{days}j {hours}h restant</span>;
    } else if (hours > 0) {
      return <span className="text-red-500 font-medium">{hours}h restant</span>;
    } else {
      return <span className="text-red-500 font-medium">Livraison imminente</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des commandes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Commandes</CardTitle>
          <CardDescription>
            Gérez toutes les commandes de vos clients avec suivi intelligent des délais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className={
                  order.status === 'delivered' ? 'bg-green-50 dark:bg-green-900/10' :
                  order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/10' :
                  getDeliveryCountdown(order.expected_delivery_date, order.status)?.props.className.includes('text-red-500') ? 'bg-red-50 dark:bg-red-900/10' : ''
                }>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.city ? (
                      <div>
                        <p className="font-medium">{order.city.name}</p>
                        <p className="text-sm text-muted-foreground">{order.city.region}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Non définie</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.total_amount.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(order.expected_delivery_date).toLocaleDateString('fr-FR')}
                      </p>
                      {getDeliveryCountdown(order.expected_delivery_date, order.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Détails
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="confirmed">Confirmée</SelectItem>
                          <SelectItem value="shipped">Expédiée</SelectItem>
                          <SelectItem value="delivered">Livrée</SelectItem>
                          <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Détails de la commande
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Fermer
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informations client</h4>
                  <div className="space-y-1">
                    <p><span className="font-medium">Nom:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Téléphone:</span> {selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_email && (
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Détails de la commande</h4>
                  <div className="space-y-1">
                    <p><span className="font-medium">ID:</span> {selectedOrder.id}</p>
                    <p><span className="font-medium">Statut:</span> {getStatusBadge(selectedOrder.status)}</p>
                    <p><span className="font-medium">Total:</span> {selectedOrder.total_amount.toLocaleString()} FCFA</p>
                    <p><span className="font-medium">Paiement:</span> {selectedOrder.payment_method === 'cash_on_delivery' ? 'À la livraison' : 'CoolPay'}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Livraison</h4>
                  <div className="space-y-1">
                    {selectedOrder.city ? (
                      <>
                        <p><span className="font-medium">Ville:</span> {selectedOrder.city.name}</p>
                        <p><span className="font-medium">Région:</span> {selectedOrder.city.region}</p>
                        <p><span className="font-medium">Délai:</span> {selectedOrder.city.delivery_days} jours</p>
                        <p><span className="font-medium">Prévue le:</span> {new Date(selectedOrder.expected_delivery_date).toLocaleDateString('fr-FR')}</p>
                        <div className="mt-2">
                          {getDeliveryCountdown(selectedOrder.expected_delivery_date, selectedOrder.status)}
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Ville non définie</p>
                    )}
                    {selectedOrder.notes && (
                      <p><span className="font-medium">Notes:</span> {selectedOrder.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Articles commandés</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{item.product.title}</p>
                        {item.product.is_premium && (
                          <Badge variant="secondary" className="mt-1">Premium</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p>Quantité: {item.quantity}</p>
                        <p className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}