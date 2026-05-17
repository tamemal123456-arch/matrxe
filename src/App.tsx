// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/i18n";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { SkeletonPage } from "@/components/SkeletonLoading";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const CreateTwin = lazy(() => import("./pages/CreateTwin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TwinChat = lazy(() => import("./pages/TwinChat"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Suspense fallback={<SkeletonPage />}><Dashboard /></Suspense>} />
              <Route path="/create-twin" element={<Suspense fallback={<SkeletonPage />}><CreateTwin /></Suspense>} />
              <Route path="/chat/:twinId" element={<Suspense fallback={<SkeletonPage />}><TwinChat /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<SkeletonPage />}><About /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<SkeletonPage />}><Contact /></Suspense>} />
              <Route path="/blog" element={<Suspense fallback={<SkeletonPage />}><Blog /></Suspense>} />
              <Route path="/admin" element={<Suspense fallback={<SkeletonPage />}><Admin /></Suspense>} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
        <CookieConsent />
        <OnboardingModal />
      </TooltipProvider>
      </I18nProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
