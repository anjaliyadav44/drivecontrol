import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="boot">Calibrating fleet instruments…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
