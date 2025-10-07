import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Link, CheckCircle, XCircle } from 'lucide-react';

// Re-using the interfaces from OrdersManagement
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

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onGenerateLink: (orderId: string) => void;
  isGeneratingLink: boolean;
}

const InfoSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h4 className="font-semibold mb-2 text-lg border-b pb-2">{title}</h4>
    <div className="space-y-2 text-sm">{children}</div>
  </div>
);

const InfoItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="flex justify-between items-start">
    <span className="font-medium text-muted-foreground">{label}:</span>
    <div className="text-right font-semibold">{children}</div>
  </div>
);

const PaymentStatusBadge = ({ status }: { status: string }) => {
  if (status === 'paid') {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">Payé</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-red-600">
      <XCircle className="w-4 h-4" />
      <span className="font-medium">Non Payé</span>
    </div>
  );
};

const OrderStatusBadge = ({ status }: { status: string }) => {
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

export function OrderDetailModal({ isOpen, onClose, order, onGenerateLink, isGeneratingLink }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la Commande</DialogTitle>
          <DialogDescription>ID: {order.id}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Col 1: Client & Livraison */}
          <div className="space-y-6">
            <InfoSection title="Client">
              <InfoItem label="Nom">{order.customer_name}</InfoItem>
              <InfoItem label="Téléphone">{order.customer_phone}</InfoItem>
              {order.customer_email && <InfoItem label="Email">{order.customer_email}</InfoItem>}
            </InfoSection>
            <InfoSection title="Livraison">
              {order.cameroon_cities ? (
                <>
                  <InfoItem label="Ville">{order.cameroon_cities.name}</InfoItem>
                  <InfoItem label="Région">{order.cameroon_cities.region}</InfoItem>
                  <InfoItem label="Délai">{order.cameroon_cities.delivery_days} jours</InfoItem>
                </>
              ) : <p className="text-muted-foreground">Non spécifiée</p>}
               <InfoItem label="Prévue le">{new Date(order.expected_delivery_date).toLocaleDateString('fr-FR')}</InfoItem>
               {order.notes && <div className="pt-2"><p className="font-medium text-muted-foreground">Notes:</p><p className="text-sm font-normal italic">"{order.notes}"</p></div>}
            </InfoSection>
          </div>

          {/* Col 2: Commande & Paiement */}
          <div className="space-y-6">
            <InfoSection title="Commande">
              <InfoItem label="Date">{new Date(order.created_at).toLocaleString('fr-FR')}</InfoItem>
              <InfoItem label="Statut"><OrderStatusBadge status={order.status} /></InfoItem>
            </InfoSection>
            <InfoSection title="Paiement">
              <InfoItem label="Statut"><PaymentStatusBadge status={order.payment_status} /></InfoItem>
              <InfoItem label="Méthode">{order.payment_method === 'cash_on_delivery' ? 'À la livraison' : 'En ligne'}</InfoItem>
              <InfoItem label="Total">{order.total_amount.toLocaleString()} FCFA</InfoItem>
              {order.payment_method !== 'cash_on_delivery' && order.payment_status !== 'paid' && (
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => onGenerateLink(order.id)}
                  disabled={isGeneratingLink}
                >
                  {isGeneratingLink ? (
                    <><Clock className="w-4 h-4 mr-2 animate-spin" />Génération...</>
                  ) : (
                    <><Link className="w-4 h-4 mr-2" />Générer un lien de paiement</>
                  )}
                </Button>
              )}
            </InfoSection>
          </div>

          {/* Col 3: Articles */}
          <div className="md:col-span-1 space-y-4">
             <InfoSection title="Articles Commandés">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {item.price.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="text-right font-bold">
                      {(item.price * item.quantity).toLocaleString()} FCFA
                    </div>
                  </div>
                ))}
             </InfoSection>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}