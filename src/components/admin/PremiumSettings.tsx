import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export const PremiumSettings = () => {
  const [frequency, setFrequency] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFrequency = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'premium_section_frequency')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data?.value) {
          setFrequency(parseInt(data.value, 10));
        }
      } catch (error) {
        console.error('Error fetching premium section frequency:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch premium section frequency.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFrequency();
  }, [toast]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'premium_section_frequency', value: frequency.toString() }, { onConflict: 'key' });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Premium section frequency updated successfully.',
      });
    } catch (error) {
      console.error('Error saving premium section frequency:', error);
      toast({
        title: 'Error',
        description: 'Failed to save premium section frequency.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Section Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Premium Section Frequency</Label>
            <Input
              id="frequency"
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value, 10))}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Show the premium section after this many products.
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};