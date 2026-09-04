import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  CarFront,
  ClipboardList,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LogOut,
  UserRound,
  Receipt,
  Users,
  Wrench,
} from "lucide-react";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/app", label: "Control room", icon: LayoutDashboard, end: true },
  { to: "/app/fleet", label: "Fleet", icon: CarFront },
  { to: "/app/health", label: "Health centre", icon: Activity },
  { to: "/app/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/app/work-orders", label: "Workshop", icon: Wrench },
  { to: "/app/garages", label: "Garages", icon: Gauge },
  { to: "/app/drivers", label: "Drivers", icon: Users },
  { to: "/app/invoices", label: "Invoices", icon: Receipt },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/profile", label: "Your desk", icon: UserRound },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to="/app" style={{ margin: "4px 8px 18px" }}>
          <Logo wordmark size={34} />
        </NavLink>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
        <div className="side-spacer" />
        <div className="user-chip">
          <strong>{user?.name}</strong>
          <span>{user?.role?.replace("_", " ")}</span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: "#dbe7e0", borderColor: "rgba(255,255,255,0.2)" }}
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </aside>
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
