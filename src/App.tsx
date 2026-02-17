import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CartProvider } from "@/context/CartContext";
import { MarketProvider } from "@/context/MarketContext";
import Index from "./pages/Index";
import { LoadingScreen } from "@/components/LoadingScreen";
import Login from "./pages/Login";
import StoreProducts from "./pages/StoreProducts";
import StoreAbout from "./pages/StoreAbout";
import StoreReviews from "./pages/StoreReviews";
import StoreStatus from "./pages/StoreStatus";
import StoreProductDetail from "./pages/StoreProductDetail";
import Dashboard from "./pages/Dashboard";
import ResellerDashboard from "./pages/ResellerDashboard";
import ResellerLicenses from "./pages/ResellerLicenses";
import ResellerApplications from "./pages/ResellerApplications";
import ResellerTransactions from "./pages/ResellerTransactions";
import ResellerProfile from "./pages/ResellerProfile";
import Profile from "./pages/Profile";
import ResellerUsers from "./pages/ResellerUsers";
import Licenses from "./pages/Licenses";
import Users from "./pages/Users";
import Clients from "./pages/Clients";
import Applications from "./pages/Applications";
import Logs from "./pages/Logs";
import Variables from "./pages/Variables";
import Resellers from "./pages/Resellers";
import Tickets from "./pages/Tickets";
import Subscriptions from "./pages/Subscriptions";
import Status from "@/pages/Status";
import CheatControl from "@/pages/CheatControl";
import ManageProducts from "@/pages/ManageProducts";
import ManageTeam from "@/pages/ManageTeam";
import ManageReviews from "./pages/ManageReviews";
import Revenue from "@/pages/Revenue";
import Orders from "@/pages/Orders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ClientOverview from "./pages/client/Overview";
import ClientOrders from "./pages/client/Orders";
import ClientSupport from "./pages/client/Support";
import LegalTerms from "./pages/LegalTerms";
import LegalPrivacy from "./pages/LegalPrivacy";
import LegalRefund from "./pages/LegalRefund";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MarketProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LoadingScreen />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<StoreProducts />} />
              <Route path="/store/product/:id" element={<StoreProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/about" element={<StoreAbout />} />
              <Route path="/reviews" element={<StoreReviews />} />
              <Route path="/store-status" element={<StoreStatus />} />

              {/* Legal & Support Routes */}
              <Route path="/legal/terms" element={<LegalTerms />} />
              <Route path="/legal/privacy" element={<LegalPrivacy />} />
              <Route path="/legal/refund" element={<LegalRefund />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />

              {/* Client Routes */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute>
                    <ClientOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/orders"
                element={
                  <ProtectedRoute>
                    <ClientOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/support"
                element={
                  <ProtectedRoute>
                    <ClientSupport />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/licenses"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Licenses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cheat-control"
                element={
                  <ProtectedRoute requiredType="admin">
                    <CheatControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-products"
                element={
                  <ProtectedRoute requiredType="admin">
                    <ManageProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Logs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/variables"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Variables />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resellers"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Resellers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Tickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revenue"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Revenue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute requiredType="admin">
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-team"
                element={
                  <ProtectedRoute requiredType="admin">
                    <ManageTeam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-reviews"
                element={
                  <ProtectedRoute requiredType="admin">
                    <ManageReviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/status"
                element={
                  <ProtectedRoute>
                    <Status />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reseller/dashboard"
                element={
                  <ProtectedRoute requiredType="reseller">
                    <ResellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reseller/licenses"
                element={
                  <ProtectedRoute requiredType="reseller">
                    <ResellerLicenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reseller/applications"
                element={
                  <ProtectedRoute requiredType="reseller">
                    <ResellerApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reseller/transactions"
                element={
                  <ProtectedRoute requiredType="reseller">
                    <ResellerTransactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reseller/profile"
                element={
                  <ProtectedRoute requiredType="reseller">
                    <ResellerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reseller/users"
                element={
                  <ProtectedRoute requiredType="reseller">
                    <ResellerUsers />
                  </ProtectedRoute>
                }
              />
              {/* Client Routes */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute requiredType="client">
                    <ClientOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/orders"
                element={
                  <ProtectedRoute requiredType="client">
                    <ClientOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/support"
                element={
                  <ProtectedRoute requiredType="client">
                    <ClientSupport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider >
      </CartProvider>
    </MarketProvider>
  </QueryClientProvider >
);

export default App;
