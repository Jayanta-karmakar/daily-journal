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
import Admin from "@/pages/Admin";
import { Analytics } from '@vercel/analytics/react';
import { APP_ROUTES, HIDE_NAV_PATHS } from "@/config/constants";

const queryClient = new QueryClient();


const AppContent = () => {
  const { session, loading } = useAppContext();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-foreground bg-background">Loading...</div>;
  }
  
  const location = useLocation();
  const isLegalPage = HIDE_NAV_PATHS.includes(location.pathname);

  if (!session) {
    return (
      <>
        <ScrollToTop />
        <OfflineBanner />
        <Routes>
          <Route path={APP_ROUTES.HOME} element={<Landing />} />
          <Route path={APP_ROUTES.LOGIN} element={<Login />} />
          <Route path={APP_ROUTES.REGISTER} element={<Register />} />
          <Route path={APP_ROUTES.PRICING} element={<Pricing />} />
          <Route path={APP_ROUTES.CONTACT} element={<Contact />} />
          <Route path={APP_ROUTES.PRIVACY} element={<PrivacyPolicy />} />


          <Route path={APP_ROUTES.TERMS} element={<TermsOfService />} />
          <Route path={APP_ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={APP_ROUTES.ADMIN} element={<Navigate to={APP_ROUTES.LOGIN} />} />
          <Route path="*" element={<Navigate to={APP_ROUTES.HOME} />} />
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
        <Route path={APP_ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={APP_ROUTES.NEW_ENTRY} element={<NewEntry />} />
        <Route path={APP_ROUTES.VIEW_ENTRY} element={<ViewEntry />} />
        <Route path={APP_ROUTES.EDIT_ENTRY} element={<EditEntry />} />
        <Route path={APP_ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={APP_ROUTES.SUMMARY} element={<MonthlySummary />} />
        <Route path={APP_ROUTES.LOGIN} element={<Navigate to={APP_ROUTES.HOME} />} />
        <Route path={APP_ROUTES.REGISTER} element={<Navigate to={APP_ROUTES.HOME} />} />
        <Route path={APP_ROUTES.PRICING} element={<Pricing />} />
        <Route path={APP_ROUTES.CONTACT} element={<Contact />} />
        <Route path={APP_ROUTES.PRIVACY} element={<PrivacyPolicy />} />
        <Route path={APP_ROUTES.ADMIN} element={<Admin />} />

        <Route path={APP_ROUTES.TERMS} element={<TermsOfService />} />
        <Route path={APP_ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
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

