
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import SidebarLayout from "./components/layout/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Billing from "./pages/Billing";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <SidebarLayout>
                    <Dashboard />
                  </SidebarLayout>
                }
              />
              <Route
                path="/services"
                element={
                  <SidebarLayout>
                    <Services />
                  </SidebarLayout>
                }
              />
              <Route
                path="/billing"
                element={
                  <SidebarLayout>
                    <Billing />
                  </SidebarLayout>
                }
              />
              <Route
                path="/inventory"
                element={
                  <SidebarLayout>
                    <Inventory />
                  </SidebarLayout>
                }
              />
              <Route
                path="/customers"
                element={
                  <SidebarLayout>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl text-muted-foreground">
                          Customers section coming soon!
                        </p>
                      </div>
                    </div>
                  </SidebarLayout>
                }
              />
              <Route
                path="/staff"
                element={
                  <SidebarLayout>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl text-muted-foreground">
                          Staff management coming soon!
                        </p>
                      </div>
                    </div>
                  </SidebarLayout>
                }
              />
              <Route
                path="/appointments"
                element={
                  <SidebarLayout>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl text-muted-foreground">
                          Appointments calendar coming soon!
                        </p>
                      </div>
                    </div>
                  </SidebarLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <SidebarLayout>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl text-muted-foreground">
                          Settings page coming soon!
                        </p>
                      </div>
                    </div>
                  </SidebarLayout>
                }
              />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
