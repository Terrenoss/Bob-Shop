import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './app/providers';
import RootLayout from './app/layout';

// Import Pages (Next.js App Router style files)
import ShopPage from './app/page';
import ProductDetailsPage from './app/product/[id]/page';
import AdminPage from './app/admin/page';
import CheckoutPage from './app/checkout/page';
import OrdersPage from './app/orders/page';
import ContactPage from './app/contact/page';
import ProfilePage from './app/profile/page';

// Legal Pages
import MentionsLegalesPage from './app/legal/mentions/page';
import CGVPage from './app/legal/cgv/page';
import PrivacyPage from './app/legal/privacy/page';

// Route Guard
const ProtectedAdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useApp();
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

const ProtectedUserRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <RootLayout>
          <Routes>
            <Route path="/" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={
                <ProtectedAdminRoute><AdminPage /></ProtectedAdminRoute>
            } />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={
                <ProtectedUserRoute><OrdersPage /></ProtectedUserRoute>
            } />
            <Route path="/profile" element={
                <ProtectedUserRoute><ProfilePage /></ProtectedUserRoute>
            } />
            
            {/* Legal Routes */}
            <Route path="/legal/mentions" element={<MentionsLegalesPage />} />
            <Route path="/legal/cgv" element={<CGVPage />} />
            <Route path="/legal/privacy" element={<PrivacyPage />} />
          </Routes>
        </RootLayout>
    );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;