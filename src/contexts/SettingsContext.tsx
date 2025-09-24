import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SettingsContextType {
  globalPrice: number;
  premiumSectionFrequency: number;
  heroStyle: 'carousel' | 'product_grid';
  heroGridRows: number;
  heroGridCols: number;
  loading: boolean;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [globalPrice, setGlobalPrice] = useState<number>(3000);
  const [premiumSectionFrequency, setPremiumSectionFrequency] = useState<number>(5);
  const [heroStyle, setHeroStyle] = useState<'carousel' | 'product_grid'>('carousel');
  const [heroGridRows, setHeroGridRows] = useState<number>(2);
  const [heroGridCols, setHeroGridCols] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
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

        const heroStyleSetting = data.find(s => s.key === 'hero_style');
        if (heroStyleSetting?.value === 'product_grid') {
          setHeroStyle('product_grid');
        } else {
          setHeroStyle('carousel');
        }

        const heroGridRowsSetting = data.find(s => s.key === 'hero_grid_rows');
        if (heroGridRowsSetting?.value) {
          setHeroGridRows(parseInt(heroGridRowsSetting.value, 10));
        }

        const heroGridColsSetting = data.find(s => s.key === 'hero_grid_cols');
        if (heroGridColsSetting?.value) {
          setHeroGridCols(parseInt(heroGridColsSetting.value, 10));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const reloadSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ globalPrice, premiumSectionFrequency, heroStyle, heroGridRows, heroGridCols, loading, reloadSettings }}>
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