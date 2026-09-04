import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { dateFmt, money } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/invoices").then((r) => setInvoices(r.data.invoices));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Accounts</div>
          <h1>Invoices</h1>
        </div>
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Number</th><th>Vehicle</th><th>Due</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="row-click" onClick={() => navigate(`/app/invoices/${inv._id}`)}>
                <td>{inv.number}</td>
                <td>{inv.vehicle?.registration}</td>
                <td>{dateFmt(inv.dueDate)}</td>
                <td>{money(inv.total)}</td>
                <td><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
