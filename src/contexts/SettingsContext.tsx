import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SettingsContextType {
  globalPrice: number;
  premiumSectionFrequency: number;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [globalPrice, setGlobalPrice] = useState<number>(3000);
  const [premiumSectionFrequency, setPremiumSectionFrequency] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('key,value');

        if (error) {
          throw error;
        }

        if (data) {
          const globalPriceSetting = data.find(s => s.key === 'global_product_price');
          if (globalPriceSetting?.value) {
            setGlobalPrice(parseInt(globalPriceSetting.value, 10));
          }

          const premiumSectionFrequencySetting = data.find(s => s.key === 'premium_section_frequency');
          if (premiumSectionFrequencySetting?.value) {
            setPremiumSectionFrequency(parseInt(premiumSectionFrequencySetting.value, 10));
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ globalPrice, premiumSectionFrequency, loading }}>
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