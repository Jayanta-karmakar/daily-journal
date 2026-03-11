import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { ThemeProvider } from "@/components/theme-provider";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import NewEntry from "./pages/NewEntry";
import ViewEntry from "./pages/ViewEntry";
import EditEntry from "./pages/EditEntry";
import SettingsPage from "./pages/SettingsPage";
import MonthlySummary from "./pages/MonthlySummary";
import NotFound from "./pages/NotFound";
import { Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const AppContent = () => {
  const { session, loading } = useAppContext();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-foreground bg-background">Loading...</div>;
  }
  
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewEntry />} />
        <Route path="/entry/:date" element={<ViewEntry />} />
        <Route path="/entry/:date/edit" element={<EditEntry />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/month-summary" element={<MonthlySummary />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/register" element={<Navigate to="/" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="daily-journal-theme">
      <TooltipProvider>
        <Sonner />
        <AppProvider>
          <AppContent />
        </AppProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

