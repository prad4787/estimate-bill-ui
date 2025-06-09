import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import ClientList from "./pages/clients/ClientList";
import AddClient from "./pages/clients/AddClient";
import EditClient from "./pages/clients/EditClient";
import ViewClient from "./pages/clients/ViewClient";
import EstimateList from "./pages/estimates/EstimateList";
import AddEstimate from "./pages/estimates/AddEstimate";
import ViewEstimate from "./pages/estimates/ViewEstimate";
import PaymentMethodList from "./pages/payments/PaymentMethodList";
import ReceiptList from "./pages/receipts/ReceiptList";
import AddReceipt from "./pages/receipts/AddReceipt";
import EditReceipt from "./pages/receipts/EditReceipt";
import ViewReceipt from "./pages/receipts/ViewReceipt";
import StockList from "./pages/stock/StockList";
import AddStock from "./pages/stock/AddStock";
import EditStock from "./pages/stock/EditStock";
import AgingReport from "./pages/reports/AgingReport";
import OrganizationSettings from "./pages/settings/OrganizationSettings";
import NotFound from "./pages/NotFound";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
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
          <Route path="stock">
            <Route index element={<StockList />} />
            <Route path="add" element={<AddStock />} />
            <Route path="edit/:id" element={<EditStock />} />
          </Route>
          <Route path="payments" element={<PaymentMethodList />} />
          <Route path="receipts">
            <Route index element={<ReceiptList />} />
            <Route path="add" element={<AddReceipt />} />
            <Route path="edit/:id" element={<EditReceipt />} />
            <Route path="view/:id" element={<ViewReceipt />} />
          </Route>
          <Route path="reports">
            <Route path="aging" element={<AgingReport />} />
          </Route>
          <Route path="settings" element={<OrganizationSettings />} />
          <Route path="settings/general" element={<OrganizationSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
