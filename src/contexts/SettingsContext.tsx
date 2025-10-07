import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

interface SettingsContextType {
  globalPrice: number;
  premiumSectionFrequency: number;
  heroStyle: 'carousel' | 'product_grid';
  heroGridRows: number;
  heroGridCols: number;
  heroGridAlternatesPremiumProducts: boolean;
  geminiModel: string;
  productGridColumns: number;
  mobileProductGridColumns: number;
  paymentMethods: PaymentMethod[];
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
  const [heroGridAlternatesPremiumProducts, setHeroGridAlternatesPremiumProducts] = useState<boolean>(false);
  const [geminiModel, setGeminiModel] = useState<string>('gemini-1.5-flash-8b');
  const [productGridColumns, setProductGridColumns] = useState<number>(3);
  const [mobileProductGridColumns, setMobileProductGridColumns] = useState<number>(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsResult, paymentMethodsResult] = await Promise.all([
        supabase.from('settings').select('key,value'),
        supabase.from('payment_methods').select('*').eq('enabled', true)
      ]);

      const { data: settingsData, error: settingsError } = settingsResult;
      if (settingsError) throw settingsError;

      if (settingsData) {
        const settingsMap = new Map(settingsData.map(s => [s.key, s.value]));
        setGlobalPrice(parseInt(settingsMap.get('global_product_price') || '3000', 10));
        setPremiumSectionFrequency(parseInt(settingsMap.get('premium_section_frequency') || '5', 10));
        setHeroStyle((settingsMap.get('hero_style') as 'carousel' | 'product_grid') || 'carousel');
        setHeroGridRows(parseInt(settingsMap.get('hero_grid_rows') || '2', 10));
        setHeroGridCols(parseInt(settingsMap.get('hero_grid_cols') || '3', 10));
        setHeroGridAlternatesPremiumProducts(settingsMap.get('hero_grid_alternates_premium_products') === 'true');
        setGeminiModel(settingsMap.get('gemini_model') || 'gemini-1.5-flash-8b');
        setProductGridColumns(parseInt(settingsMap.get('product_grid_columns') || '3', 10));
        setMobileProductGridColumns(parseInt(settingsMap.get('mobile_product_grid_columns') || '1', 10));
      }

      const { data: paymentMethodsData, error: paymentMethodsError } = paymentMethodsResult;
      if (paymentMethodsError) throw paymentMethodsError;

      if (paymentMethodsData) {
        setPaymentMethods(paymentMethodsData);
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
    <SettingsContext.Provider value={{ globalPrice, premiumSectionFrequency, heroStyle, heroGridRows, heroGridCols, heroGridAlternatesPremiumProducts, geminiModel, productGridColumns, mobileProductGridColumns, paymentMethods, loading, reloadSettings }}>
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