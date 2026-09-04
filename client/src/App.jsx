import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Fleet from "./pages/Fleet.jsx";
import VehicleDetail from "./pages/VehicleDetail.jsx";
import HealthCenter from "./pages/HealthCenter.jsx";
import Bookings from "./pages/Bookings.jsx";
import WorkOrders from "./pages/WorkOrders.jsx";
import WorkOrderDetail from "./pages/WorkOrderDetail.jsx";
import Garages from "./pages/Garages.jsx";
import Drivers from "./pages/Drivers.jsx";
import Invoices from "./pages/Invoices.jsx";
import InvoiceDetail from "./pages/InvoiceDetail.jsx";
import Payments from "./pages/Payments.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="fleet/:id" element={<VehicleDetail />} />
        <Route path="health" element={<HealthCenter />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="work-orders/:id" element={<WorkOrderDetail />} />
        <Route path="garages" element={<Garages />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
