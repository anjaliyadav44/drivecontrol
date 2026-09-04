import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { money } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function WorkOrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wo, setWo] = useState(null);
  const [line, setLine] = useState({ description: "", kind: "labour", qty: 1, unitPrice: 0 });

  async function load() {
    const { data } = await api.get(`/work-orders/${id}`);
    setWo(data.workOrder);
  }
  useEffect(() => { load(); }, [id]);

  if (!wo) return <p className="muted">Opening job card…</p>;
  const total = (wo.lines || []).reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const canGarage = ["admin", "fleet_manager", "garage"].includes(user?.role);
  const canAuth = ["admin", "fleet_manager"].includes(user?.role);

  async function addLine(e) {
    e.preventDefault();
    await api.post(`/work-orders/${id}/lines`, line);
    setLine({ description: "", kind: "labour", qty: 1, unitPrice: 0 });
    load();
  }

  async function setStatus(status) {
    await api.patch(`/work-orders/${id}`, { status, findings: wo.findings });
    load();
  }

  async function authorise() {
    await api.post(`/work-orders/${id}/authorise`);
    load();
  }

  async function invoice() {
    const { data } = await api.post(`/work-orders/${id}/invoice`);
    navigate(`/app/invoices/${data.invoice._id}`);
  }

  async function saveFindings() {
    await api.patch(`/work-orders/${id}`, { findings: wo.findings });
    load();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Job card</div>
          <h1>{wo.reference}</h1>
          <p className="muted">{wo.vehicle?.registration} · {wo.garage?.name}</p>
        </div>
        <div className="toolbar">
          <StatusBadge status={wo.status} />
          {canGarage && wo.status === "queued" && <button className="btn btn-pine btn-sm" onClick={() => setStatus("in_progress")}>Start work</button>}
          {canAuth && wo.status === "awaiting_auth" && <button className="btn btn-copper btn-sm" onClick={authorise}>Authorise all lines</button>}
          {canGarage && ["in_progress", "awaiting_auth"].includes(wo.status) && <button className="btn btn-pine btn-sm" onClick={() => setStatus("ready")}>Mark ready</button>}
          {canGarage && wo.status === "ready" && <button className="btn btn-copper btn-sm" onClick={invoice}>Raise invoice</button>}
        </div>
      </div>
      <div className="split">
        <div className="panel">
          <h3>Lines</h3>
          <table className="table">
            <thead><tr><th>Description</th><th>Kind</th><th>Qty</th><th>Rate</th><th>Auth</th></tr></thead>
            <tbody>
              {wo.lines?.map((l) => (
                <tr key={l._id}>
                  <td>{l.description}</td>
                  <td>{l.kind}</td>
                  <td>{l.qty}</td>
                  <td>{money(l.unitPrice)}</td>
                  <td>{l.authorised ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><strong>Total {money(total)}</strong> · VAT extra on invoice</p>
          {canGarage && (
            <form onSubmit={addLine} className="form-grid" style={{ marginTop: 12 }}>
              <div><label>Description</label><input required value={line.description} onChange={(e) => setLine({ ...line, description: e.target.value })} /></div>
              <div>
                <label>Kind</label>
                <select value={line.kind} onChange={(e) => setLine({ ...line, kind: e.target.value })}>
                  <option>labour</option><option>parts</option><option>misc</option>
                </select>
              </div>
              <div><label>Qty</label><input type="number" step="0.5" value={line.qty} onChange={(e) => setLine({ ...line, qty: Number(e.target.value) })} /></div>
              <div><label>Unit price</label><input type="number" value={line.unitPrice} onChange={(e) => setLine({ ...line, unitPrice: Number(e.target.value) })} /></div>
              <button className="btn btn-sm btn-pine" style={{ marginTop: 18 }}>Add line</button>
            </form>
          )}
        </div>
        <div className="panel">
          <h3>Complaint</h3>
          <p>{wo.complaint || "—"}</p>
          <label>Findings</label>
          <textarea rows={5} value={wo.findings || ""} onChange={(e) => setWo({ ...wo, findings: e.target.value })} />
          {canGarage && <button className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={saveFindings}>Save findings</button>}
        </div>
      </div>
    </>
  );
}
