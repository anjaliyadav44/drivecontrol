import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/client.js";
import HealthRing from "../components/HealthRing.jsx";
import { dateFmt, money } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="muted">Reading the yard…</p>;
  const { kpis, vehicles, bookings, workOrders, invoices, criticalAlerts } = data;
  const chart = [
    { name: "Healthy", n: vehicles.filter((v) => v.healthStatus === "healthy").length },
    { name: "Watch", n: vehicles.filter((v) => v.healthStatus === "watch").length },
    { name: "Attention", n: vehicles.filter((v) => v.healthStatus === "attention").length },
    { name: "VOR", n: vehicles.filter((v) => v.healthStatus === "vor").length },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Control room</div>
          <h1>Yard pulse</h1>
        </div>
        <HealthRing score={kpis.avgHealth} label="Fleet avg" />
      </div>
      <div className="kpis">
        <div className="kpi"><span>Fleet</span><strong>{kpis.fleetSize}</strong></div>
        <div className="kpi"><span>Off the road</span><strong>{kpis.vor}</strong></div>
        <div className="kpi"><span>Open workshop</span><strong>{kpis.openWork}</strong></div>
        <div className="kpi"><span>Unpaid</span><strong>{money(kpis.outstanding)}</strong></div>
      </div>
      <div className="split">
        <div className="panel">
          <h3>Health mix</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chart}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="n" fill="#1f5746" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <h3>Critical alerts</h3>
          {criticalAlerts.length === 0 && <p className="muted">No red flags.</p>}
          {criticalAlerts.slice(0, 6).map((a, i) => (
            <div key={i} className="alert critical" onClick={() => navigate(`/app/fleet/${a.vehicleId}`)} style={{ cursor: "pointer" }}>
              <strong>{a.registration}</strong> · {a.message}
            </div>
          ))}
        </div>
      </div>
      <div className="split" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Upcoming bookings</h3>
          <table className="table">
            <thead><tr><th>When</th><th>Vehicle</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="row-click" onClick={() => navigate("/app/bookings")}>
                  <td>{dateFmt(b.scheduledAt)}</td>
                  <td>{b.vehicle?.registration}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Workshop + due invoices</h3>
          {workOrders.map((w) => (
            <p key={w._id}><strong>{w.reference}</strong> {w.vehicle?.registration} · <StatusBadge status={w.status} /></p>
          ))}
          {invoices.map((inv) => (
            <p key={inv._id}>{inv.number} · {money(inv.total)} due {dateFmt(inv.dueDate)}</p>
          ))}
        </div>
      </div>
    </>
  );
}
