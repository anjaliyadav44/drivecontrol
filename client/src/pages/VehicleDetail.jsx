import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import HealthRing from "../components/HealthRing.jsx";
import { dateFmt } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

function barClass(n) {
  if (n < 40) return "bar bad";
  if (n < 65) return "bar warn";
  return "bar";
}

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pack, setPack] = useState(null);
  const [scan, setScan] = useState({});
  const [doc, setDoc] = useState({ name: "", kind: "service" });

  async function load() {
    const { data } = await api.get(`/vehicles/${id}`);
    setPack(data);
    setScan(data.vehicle.components || {});
  }
  useEffect(() => { load(); }, [id]);

  if (!pack) return <p className="muted">Opening vehicle file…</p>;
  const { vehicle, alerts, logs } = pack;

  async function saveScan(e) {
    e.preventDefault();
    await api.post(`/vehicles/${id}/scan`, { components: scan, mileage: vehicle.mileage });
    load();
  }

  async function addDoc(e) {
    e.preventDefault();
    await api.post(`/vehicles/${id}/documents`, doc);
    setDoc({ name: "", kind: "service" });
    load();
  }

  async function toggleVor() {
    await api.patch(`/vehicles/${id}`, { vor: !vehicle.vor });
    load();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Vehicle file</div>
          <h1>{vehicle.registration}</h1>
          <p className="muted">{vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.fuelType} · {vehicle.mileage?.toLocaleString()} mi</p>
        </div>
        <div className="toolbar">
          <HealthRing score={vehicle.healthScore} />
          <StatusBadge status={vehicle.healthStatus} />
          <button className="btn btn-sm btn-ghost" onClick={toggleVor}>{vehicle.vor ? "Clear VOR" : "Mark VOR"}</button>
          <button className="btn btn-sm btn-copper" onClick={() => navigate("/app/bookings")}>Book work</button>
        </div>
      </div>
      <div className="split">
        <div className="panel">
          <h3>Component pulse</h3>
          <form onSubmit={saveScan} className="bars">
            {Object.entries(scan).map(([k, v]) => (
              <label key={k} className="bar-row">
                <span>{k}</span>
                <div className={barClass(Number(v))}><i style={{ width: `${v}%` }} /></div>
                <input type="number" min="0" max="100" value={v} onChange={(e) => setScan({ ...scan, [k]: Number(e.target.value) })} />
              </label>
            ))}
            <button className="btn btn-pine btn-sm" style={{ marginTop: 8 }}>Record diagnostic scan</button>
          </form>
        </div>
        <div>
          <div className="panel">
            <h3>Clocks</h3>
            <p>MOT {dateFmt(vehicle.motDue)}</p>
            <p>Service {dateFmt(vehicle.serviceDue)}</p>
            <p>Insurance {dateFmt(vehicle.insuranceDue)}</p>
            <p>Tax {dateFmt(vehicle.taxDue)}</p>
            <p>Driver {vehicle.assignedDriver?.name || "—"}</p>
            <p>Garage {vehicle.preferredGarage?.name || "—"}</p>
          </div>
          <div className="panel" style={{ marginTop: 16 }}>
            <h3>Alerts</h3>
            {alerts.map((a, i) => (
              <div key={i} className={`alert ${a.severity}`}>{a.message}</div>
            ))}
            {!alerts.length && <p className="muted">All clocks green.</p>}
          </div>
        </div>
      </div>
      <div className="split" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Health log</h3>
          <table className="table">
            <thead><tr><th>When</th><th>Score</th><th>Source</th><th>Notes</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{dateFmt(l.createdAt)}</td>
                  <td>{l.score}</td>
                  <td>{l.source}</td>
                  <td>{l.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Documents</h3>
          <ul>
            {vehicle.documents?.map((d, i) => (
              <li key={i}>{d.name} · {d.kind}</li>
            ))}
          </ul>
          <form onSubmit={addDoc}>
            <label>Add record</label>
            <input value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} required placeholder="Document name" />
            <select value={doc.kind} onChange={(e) => setDoc({ ...doc, kind: e.target.value })} style={{ marginTop: 8 }}>
              <option value="mot">MOT</option>
              <option value="insurance">Insurance</option>
              <option value="service">Service</option>
              <option value="invoice">Invoice</option>
              <option value="other">Other</option>
            </select>
            <button className="btn btn-sm btn-pine" style={{ marginTop: 10 }}>Attach</button>
          </form>
        </div>
      </div>
    </>
  );
}
