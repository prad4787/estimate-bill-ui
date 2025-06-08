import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import AddClient from './pages/clients/AddClient';
import EditClient from './pages/clients/EditClient';
import ViewClient from './pages/clients/ViewClient';
import EstimateList from './pages/estimates/EstimateList';
import AddEstimate from './pages/estimates/AddEstimate';
import ViewEstimate from './pages/estimates/ViewEstimate';
import PaymentMethodList from './pages/payments/PaymentMethodList';
import ReceiptList from './pages/receipts/ReceiptList';
import AddReceipt from './pages/receipts/AddReceipt';
import OrganizationSettings from './pages/settings/OrganizationSettings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients">
          <Route index element={<ClientList />} />
          <Route path="add" element={<AddClient />} />
          <Route path="edit/:id" element={<EditClient />} />
          <Route path="view/:id" element={<ViewClient />} />
        </Route>
        <Route path="estimates">
          <Route index element={<EstimateList />} />
          <Route path="add" element={<AddEstimate />} />
          <Route path=":id" element={<ViewEstimate />} />
        </Route>
        <Route path="payments" element={<PaymentMethodList />} />
        <Route path="receipts">
          <Route index element={<ReceiptList />} />
          <Route path="add" element={<AddReceipt />} />
        </Route>
        <Route path="settings" element={<OrganizationSettings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;