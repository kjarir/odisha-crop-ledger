import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

// Pages
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Auth/Login";
import { Signup } from "./pages/Auth/Signup";
import { FarmerDashboard } from "./pages/Dashboard/FarmerDashboard";
import { Marketplace } from "./pages/Marketplace";
import { TrackProducts } from "./pages/TrackProducts";
import { Profile } from "./pages/Profile";
import { BatchRegistration } from "./pages/BatchRegistration";
import { Admin } from "./pages/Admin";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<FarmerDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/track" element={<TrackProducts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register-batch" element={<BatchRegistration />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
