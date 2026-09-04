import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import api from "../api/client.js";

const COLORS = ["#2f8f5b", "#d4a017", "#c4783a", "#c44732"];

export default function HealthCenter() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/health/overview").then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="muted">Scanning fleet vitals…</p>;
  const pie = [
    { name: "Healthy", value: data.counts.healthy },
    { name: "Watch", value: data.counts.watch },
    { name: "Attention", value: data.counts.attention },
    { name: "VOR", value: data.counts.vor },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Diagnostics</div>
          <h1>Health centre</h1>
        </div>
      </div>
      <div className="split">
        <div className="panel">
          <h3>All alerts</h3>
          {data.alerts.map((a, i) => (
            <div key={i} className={`alert ${a.severity}`} style={{ cursor: "pointer" }} onClick={() => navigate(`/app/fleet/${a.vehicleId}`)}>
              <strong>{a.registration}</strong> {a.make} {a.model} — {a.message}
            </div>
          ))}
          {!data.alerts.length && <p className="muted">Nothing needs a wrench.</p>}
        </div>
        <div className="panel">
          <h3>Status mix</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {pie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <h3>Recent scans</h3>
          {data.logs.map((l) => (
            <p key={l._id} className="muted">{l.vehicle?.registration} scored {l.score}</p>
          ))}
        </div>
      </div>
    </>
  );
}
