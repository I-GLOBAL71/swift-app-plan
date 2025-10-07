import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/contexts/SettingsContext';

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

const PaymentMethodSettings = () => {
  const { reloadSettings } = useSettings();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('payment_methods').select('*');
    if (error) {
      toast({
        title: 'Error fetching payment methods',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setPaymentMethods(data);
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    const originalMethods = [...paymentMethods];
    const newStatus = !currentEnabled;

    // Optimistic UI update
    setPaymentMethods(prevMethods =>
      prevMethods.map(method =>
        method.id === id ? { ...method, enabled: newStatus } : method
      )
    );

    const { error } = await supabase
      .from('payment_methods')
      .update({ enabled: newStatus })
      .eq('id', id);

    if (error) {
      // Revert on error
      setPaymentMethods(originalMethods);
      toast({
        title: 'Error updating payment method',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Payment method updated',
        description: `Successfully ${newStatus ? 'enabled' : 'disabled'} the payment method.`,
      });
      reloadSettings();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between">
            <Label htmlFor={`payment-method-${method.id}`}>{method.name}</Label>
            <Switch
              id={`payment-method-${method.id}`}
              checked={method.enabled}
              onCheckedChange={() => handleToggle(method.id, method.enabled)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSettings;