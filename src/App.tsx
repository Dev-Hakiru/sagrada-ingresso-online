
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, RequireAuth } from "./context/AuthContext";

// Pages
import Index from "./pages/Index";
import GamesPage from "./pages/GamesPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import TicketsPage from "./pages/TicketsPage";
import LoginPage from "./pages/LoginPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import GamesManagement from "./components/admin/GamesManagement";

const queryClient = new QueryClient();

const App: React.FC = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/games" element={<RequireAuth><GamesPage /></RequireAuth>} />
                <Route path="/games/:gameId/seats" element={<RequireAuth><SeatSelectionPage /></RequireAuth>} />
                <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
                <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
                <Route path="/tickets" element={<RequireAuth><TicketsPage /></RequireAuth>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/support" element={<RequireAuth><SupportPage /></RequireAuth>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
                <Route path="/admin/*" element={<RequireAuth><AdminLayout /></RequireAuth>}>
                  <Route path="games" element={<GamesManagement />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
