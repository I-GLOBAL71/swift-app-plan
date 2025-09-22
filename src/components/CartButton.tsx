import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckoutModal } from './CheckoutModal';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className }: CartButtonProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const { cartCount, cartItems, clearCart } = useCart();

  const handleOrderComplete = () => {
    clearCart();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowCheckout(true)}
        className={`relative ${className}`}
        disabled={cartCount === 0}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Panier
        {cartCount > 0 && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Button>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
}