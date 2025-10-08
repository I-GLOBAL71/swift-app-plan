import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Phone, Mail, Clock, Calendar, Link, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDetailModal } from './OrderDetailModal';
import { GeneratedPaymentLinkModal } from './GeneratedPaymentLinkModal';

// Define interfaces for nested objects first
interface City {
  id: string;
  name: string;
  region: string;
  delivery_days: number;
}

interface Product {
  id: string;
  title: string;
  is_premium: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

// Main Order interface
interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  status: string;
  notes: string;
  payment_method: string;
  payment_status: string;
  expected_delivery_date: string;
  created_at: string;
  city_id: string | null;
  cameroon_cities: City | null;
  order_items: OrderItem[];
}

export function OrdersManagement() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);

  useEffect(() => {
    console.log("OrdersManagement component mounted. Initializing...");
    loadOrders();
  }, []);

  useEffect(() => {
    console.log("Selected order state has been updated:", selectedOrder);
  }, [selectedOrder]);

  const handleSelectOrder = (order: Order) => {
    console.log(`"Détails" button clicked. Attempting to select order ID: ${order.id}`, order);
    setSelectedOrder(order);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Use an explicit select to guarantee all fields are fetched correctly
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          customer_email,
          total_amount,
          status,
          notes,
          payment_method,
          expected_delivery_date,
          created_at,
          city_id,
          cameroon_cities ( * ),
          order_items (
            *,
            product:products ( * )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Orders successfully loaded from database:", data);
      const loadedOrders = data as Order[] || [];
      setAllOrders(loadedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error("Erreur lors du chargement des commandes", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (tab: string, ordersToFilter: Order[]) => {
    // Pour le moment, on affiche toutes les commandes car la colonne payment_status n'existe pas
    setFilteredOrders(ordersToFilter);
  };

  useEffect(() => {
    filterOrders(activeTab, allOrders);
  }, [activeTab, allOrders]);

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

  const generatePaymentLink = async (orderId: string) => {
    setGeneratingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-payment-link', {
        body: { orderId },
      });

      if (error) throw error;

      const paymentUrlData = data?.paymentUrl;
      if (paymentUrlData) {
        setPaymentUrl(paymentUrlData);
        setShowPaymentLinkModal(true);
        setSelectedOrder(null); // Close the detail modal
      } else {
        throw new Error("URL de paiement non reçue.");
      }
    } catch (error: any) {
      console.error("Erreur lors de la génération du lien de paiement:", error);
      toast.error("Erreur lors de la génération du lien", {
        description: error.message,
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    const statusLabels: { [key: string]: string } = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return (
      <Badge className={`text-white ${statusColors[status] || 'bg-gray-500'}`}>
        {statusLabels[status] || status}
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

  const PaymentStatusBadge = ({ status }: { status: string }) => {
    // Utiliser le statut de la commande comme indicateur temporaire
    if (status === 'confirmed' || status === 'delivered') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Confirmé</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-orange-600">
        <XCircle className="w-4 h-4" />
        <span className="font-medium">En attente</span>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des commandes...</div>;
  }

  console.log("Rendering component. Current selected order:", selectedOrder);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes ({allOrders.length})</TabsTrigger>
        </TabsList>
      </Tabs>

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
                <TableHead>Paiement</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const countdown = getDeliveryCountdown(order.expected_delivery_date, order.status);
                const isDelayed = countdown?.props.className.includes('text-red-500');

                const rowClass =
                  order.status === 'delivered' ? 'bg-green-50 dark:bg-green-900/10' :
                  order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/10' :
                  isDelayed ? 'bg-red-50 dark:bg-red-900/10' : '';

                return (
                  <TableRow key={order.id} className={rowClass}>
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
                      {order.cameroon_cities ? (
                        <div>
                          <p className="font-medium">{order.cameroon_cities.name}</p>
                          <p className="text-sm text-muted-foreground">{order.cameroon_cities.region}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Non définie</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.status} />
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
                        {countdown}
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
                          onClick={() => handleSelectOrder(order)}
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onGenerateLink={generatePaymentLink}
        isGeneratingLink={generatingLink}
      />

      <GeneratedPaymentLinkModal
        isOpen={showPaymentLinkModal}
        onClose={() => setShowPaymentLinkModal(false)}
        paymentUrl={paymentUrl}
      />
    </div>
  );
}