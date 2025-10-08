import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckoutModal } from './CheckoutModal';
import { toImagesArray } from '@/lib/utils';

export function PersistentCartDrawer() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { cartItems, cartCount, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  // Afficher le drawer temporairement lors de l'ajout d'un produit
  useEffect(() => {
    if (cartCount > 0 && !justAdded) {
      setJustAdded(true);
      setIsMinimized(false);
      
      // Minimiser automatiquement après 4 secondes
      const timer = setTimeout(() => {
        setIsMinimized(true);
        setTimeout(() => setJustAdded(false), 300);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleOrderComplete = () => {
    clearCart();
    setShowCheckout(false);
    setIsMinimized(true);
  };

  if (cartCount === 0) return null;

  return (
    <>
      {/* Drawer persistant */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-2xl transition-all duration-300 ease-in-out",
          isMinimized ? "translate-y-[calc(100%-60px)]" : "translate-y-0"
        )}
      >
        {/* Header du drawer - toujours visible */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">Mon Panier</p>
              <p className="text-xs text-muted-foreground">{cartCount} article{cartCount > 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-lg text-primary">{totalPrice.toLocaleString()} FCFA</p>
            </div>
            <div className={cn(
              "transition-transform duration-300",
              isMinimized ? "rotate-180" : "rotate-0"
            )}>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Contenu du drawer */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {/* Message d'encouragement */}
          {justAdded && !isMinimized && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 animate-in slide-in-from-bottom">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium text-center">
                ✨ Article ajouté ! Continuez à explorer nos produits
              </p>
            </div>
          )}

          {/* Liste des articles */}
          {cartItems.map((item) => {
            const images = toImagesArray(item.image_url);
            const imageUrl = images.length > 0 ? images[0] : '/placeholder.svg';
            
            return (
              <div
                key={item.id}
                className="flex gap-3 bg-muted/30 rounded-lg p-3 transition-all hover:bg-muted/50"
              >
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  <p className="text-primary font-semibold text-sm mt-1">
                    {item.price.toLocaleString()} FCFA
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex-shrink-0"
                  onClick={() => removeFromCart(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {/* Actions */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">
                {totalPrice.toLocaleString()} FCFA
              </span>
            </div>
            
            <Button
              onClick={() => {
                setShowCheckout(true);
                setIsMinimized(true);
              }}
              className="w-full"
              size="lg"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Passer la commande
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-2">
              🎉 Continuez à ajouter des produits à votre panier
            </p>
          </div>
        </div>
      </div>

      {/* Modal de checkout */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
}
