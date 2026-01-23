import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CookieConsent } from "./components/CookieConsent";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthModal } from "./components/AuthModal";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitArticle from "./pages/SubmitArticle";
import EditArticle from "./pages/EditArticle";
import ArticleDetail from "./pages/ArticleDetail";
import PublicProfile from "./pages/PublicProfile";
import Achievements from "./pages/Achievements";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthModalWrapper = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    // Only show modal if user is not logged in
    if (!user) {
      const timer = setTimeout(() => {
        // Check if user has dismissed the modal before
        const dismissed = sessionStorage.getItem('authModalDismissed');
        if (!dismissed) {
          setShowAuthModal(true);
        }
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleOpenChange = (open: boolean) => {
    setShowAuthModal(open);
    if (!open) {
      sessionStorage.setItem('authModalDismissed', 'true');
    }
  };

  return <AuthModal open={showAuthModal} onOpenChange={handleOpenChange} />;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/submit-article" element={<SubmitArticle />} />
                  <Route path="/edit-article/:id" element={<EditArticle />} />
                  <Route path="/article/:id" element={<ArticleDetail />} />
                  <Route path="/profile/:id" element={<PublicProfile />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <CookieConsent />
              <AuthModalWrapper />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
