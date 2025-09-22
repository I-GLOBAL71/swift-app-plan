import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SettingsContextType {
  globalPrice: number;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [globalPrice, setGlobalPrice] = useState<number>(3000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalPrice = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'global_product_price')
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
          throw error;
        }

        if (data?.value) {
          setGlobalPrice(parseInt(data.value, 10));
        }
      } catch (error) {
        console.error('Error fetching global price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalPrice();
  }, []);

  return (
    <SettingsContext.Provider value={{ globalPrice, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};