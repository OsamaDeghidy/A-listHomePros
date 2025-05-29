import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';

// Layout
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Layout from './components/layout/Layout';

// Components
import ToastContainer from './components/notifications/ToastContainer';

// Pages
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SearchPage from './pages/SearchPage';
import ProProfilePage from './pages/ProProfilePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentDetailsPage from './pages/AppointmentDetailsPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ProDashboardPage from './pages/ProDashboardPage';
import ProfileEditPage from './pages/ProfileEditPage';
import MessagesPage from './pages/MessagesPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import PaymentPage from './pages/PaymentPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import ApiDocsPage from './pages/ApiDocsPage';
import FAQPage from './pages/FAQPage';
import HelpCenterPage from './pages/HelpCenterPage';
import SettingsPage from './pages/SettingsPage';
import BookingCalendarPage from './pages/BookingCalendarPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ServiceCategoriesPage from './pages/ServiceCategoriesPage';
import ProOnboardingPage from './pages/ProOnboardingPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Auth & Protected Routes
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardRedirector from './components/common/DashboardRedirector';
import { useAuth } from './hooks/useAuth';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Helmet>
          <meta charSet="utf-8" />
          <title>A-List Home Pros</title>
          <meta name="description" content="Find top-rated home service professionals in your area" />
          <link rel="canonical" href="https://alisthomepros.com" />
        </Helmet>
        
        {/* Toast Notifications Container */}
        <ToastContainer />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="service/:id" element={<ServiceDetailPage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="api-docs" element={<ApiDocsPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:id" element={<BlogPostPage />} />
            <Route path="services" element={<ServiceCategoriesPage />} />
            <Route path="pro-onboarding" element={<ProOnboardingPage />} />
            
            {/* Protected Routes (public layout) */}
            <Route path="booking/:proId" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="booking-confirmation" element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            } />
            <Route path="appointments" element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            } />
            <Route path="appointments/:id" element={
              <ProtectedRoute>
                <AppointmentDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="payment/:bookingId" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="reviews/:proId" element={<ReviewsPage />} />
          </Route>
          
          {/* Professional Profile Route - Separate from MainLayout to avoid duplicate navbar */}
          <Route path="pros/:id" element={<ProProfilePage />} />
          <Route path="pro/:id" element={<Navigate to="../pros/:id" replace />} />
          
          {/* Role-based Dashboard Redirector */}
          <Route path="dashboard" element={<DashboardRedirector />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboardPage />} />
            <Route path="profile" element={<ProfileEditPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:conversationId" element={<MessagesPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="activity" element={<ActivityHistoryPage />} />
            <Route path="calendar" element={<BookingCalendarPage />} />
            <Route path="payment-history" element={<PaymentHistoryPage />} />
            <Route path="payment/:bookingId" element={<PaymentPage />} />
          </Route>

          {/* Pro Dashboard Routes */}
          <Route path="/pro-dashboard" element={
            <ProtectedRoute requiresPro={true}>
              <DashboardLayout isPro={true} />
            </ProtectedRoute>
          }>
            <Route index element={<ProDashboardPage />} />
            <Route path="profile" element={<ProfileEditPage isPro={true} />} />
            <Route path="messages" element={<MessagesPage isPro={true} />} />
            <Route path="messages/:conversationId" element={<MessagesPage isPro={true} />} />
            <Route path="reviews" element={<ReviewsPage isPro={true} />} />
            <Route path="notifications" element={<NotificationsPage isPro={true} />} />
            <Route path="settings" element={<SettingsPage isPro={true} />} />
            <Route path="calendar" element={<BookingCalendarPage isPro={true} />} />
            <Route path="payment-history" element={<PaymentHistoryPage isPro={true} />} />
          </Route>
          
          {/* 404 - Page Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
