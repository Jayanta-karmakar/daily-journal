import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { ThemeProvider } from "@/components/theme-provider";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import ScrollToTop from "@/components/ScrollToTop";
import OfflineBanner from "@/components/OfflineBanner";
import Dashboard from "./pages/Dashboard";
import NewEntry from "./pages/NewEntry";
import ViewEntry from "./pages/ViewEntry";
import EditEntry from "./pages/EditEntry";
import SettingsPage from "./pages/SettingsPage";
import MonthlySummary from "./pages/MonthlySummary";
import NotFound from "./pages/NotFound";
import { Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import { Analytics } from '@vercel/analytics/react';

const queryClient = new QueryClient();


const AppContent = () => {
  const { session, loading } = useAppContext();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-foreground bg-background">Loading...</div>;
  }
  
  const location = useLocation();
  const isLegalPage = ["/privacy", "/terms", "/contact", "/forgot-password", "/reset-password"].includes(location.pathname);

  if (!session) {
    return (
      <>
        <ScrollToTop />
        <OfflineBanner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />


          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <OfflineBanner />
      {!isLegalPage && <TopNav />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewEntry />} />
        <Route path="/entry/:date" element={<ViewEntry />} />
        <Route path="/entry/:date/edit" element={<EditEntry />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/month-summary" element={<MonthlySummary />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/register" element={<Navigate to="/" />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />


        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isLegalPage && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="daily-journal-theme-v2">
      <TooltipProvider>
        <Sonner />
        <AppProvider>
          <BrowserRouter>
            <AppContent />
            <Analytics />
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

