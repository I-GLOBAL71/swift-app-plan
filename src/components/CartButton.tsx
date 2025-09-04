import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckoutModal } from './CheckoutModal';
import { ShoppingCart } from 'lucide-react';

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

interface CartButtonProps {
  className?: string;
}

// Simple cart state management - in a real app you'd use Context or a state management library
const cartState = {
  items: [] as CartItem[],
  listeners: [] as (() => void)[],
  
  addItem(product: Product) {
    const existingIndex = this.items.findIndex(item => item.id === product.id);
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.notifyListeners();
  },
  
  removeItem(productId: string) {
    const index = this.items.findIndex(item => item.id === productId);
    if (index >= 0) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity -= 1;
      } else {
        this.items.splice(index, 1);
      }
    }
    this.notifyListeners();
  },
  
  clearCart() {
    this.items = [];
    this.notifyListeners();
  },
  
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },
  
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
};

export function CartButton({ className }: CartButtonProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [itemCount, setItemCount] = useState(cartState.getItemCount());

  React.useEffect(() => {
    return cartState.subscribe(() => {
      setItemCount(cartState.getItemCount());
    });
  }, []);

  const handleOrderComplete = () => {
    cartState.clearCart();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowCheckout(true)}
        className={`relative ${className}`}
        disabled={itemCount === 0}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Panier
        {itemCount > 0 && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartState.items}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
}

// Fonction pour ajouter un produit au panier (à utiliser depuis d'autres composants)
export const addToCart = (product: Product) => {
  cartState.addItem(product);
};

// Fonction pour obtenir le nombre d'articles dans le panier
export const getCartItemCount = () => {
  return cartState.getItemCount();
};

// Export du state du panier pour d'autres composants si nécessaire
export { cartState };