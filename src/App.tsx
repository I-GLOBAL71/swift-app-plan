import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PremiumProducts from "./pages/PremiumProducts";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetail from "./pages/ProductDetail";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import Layout from "./components/Layout";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CartProvider } from "./contexts/CartContext";
import AboutPage from "./pages/AboutPage";
import DeliveryPage from "./pages/DeliveryPage";
import ReturnsPage from "./pages/ReturnsPage";
import SupportPage from "./pages/SupportPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ScrollToTop from "./components/ScrollToTop";
import HowItWorksPage from "./pages/HowItWorksPage";
import InstallPWAPrompt from "./components/InstallPWAPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <InstallPWAPrompt />
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/products" element={<Layout><Products /></Layout>} />
              <Route path="/premium" element={<Layout><PremiumProducts /></Layout>} />
              <Route path="/product/:slug/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/order-confirmation" element={<Layout><OrderConfirmation /></Layout>} />
              <Route path="/order-tracking" element={<Layout><OrderTracking /></Layout>} />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route path="/delivery" element={<Layout><DeliveryPage /></Layout>} />
              <Route path="/returns" element={<Layout><ReturnsPage /></Layout>} />
              <Route path="/support" element={<Layout><SupportPage /></Layout>} />
              <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
              <Route path="/terms-of-service" element={<Layout><TermsOfServicePage /></Layout>} />
              <Route path="/how-it-works" element={<Layout><HowItWorksPage /></Layout>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
