import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { money } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/work-orders").then((r) => setOrders(r.data.workOrders));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">My garage</div>
          <h1>Workshop</h1>
        </div>
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>Job</th><th>Vehicle</th><th>Garage</th><th>Status</th><th>Value</th></tr>
          </thead>
          <tbody>
            {orders.map((w) => (
              <tr key={w._id} className="row-click" onClick={() => navigate(`/app/work-orders/${w._id}`)}>
                <td>{w.reference}</td>
                <td>{w.vehicle?.registration}</td>
                <td>{w.garage?.name}</td>
                <td><StatusBadge status={w.status} /></td>
                <td>{money((w.lines || []).reduce((s, l) => s + l.qty * l.unitPrice, 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
