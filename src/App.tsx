import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import NewEntry from "./pages/NewEntry";
import ViewEntry from "./pages/ViewEntry";
import EditEntry from "./pages/EditEntry";
import SettingsPage from "./pages/SettingsPage";
import MonthlySummary from "./pages/MonthlySummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <TopNav />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewEntry />} />
            <Route path="/entry/:date" element={<ViewEntry />} />
            <Route path="/entry/:date/edit" element={<EditEntry />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/month-summary" element={<MonthlySummary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
