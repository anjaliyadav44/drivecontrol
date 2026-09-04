import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import HealthRing from "../components/HealthRing.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const empty = {
  registration: "", make: "", model: "", year: 2022, color: "", fuelType: "petrol", mileage: 0,
};

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = ["admin", "fleet_manager"].includes(user?.role);

  async function load() {
    const { data } = await api.get("/vehicles", { params: { q } });
    setVehicles(data.vehicles);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (canEdit) api.get("/users", { params: { role: "driver" } }).then((r) => setDrivers(r.data.users));
  }, [canEdit]);

  async function create(e) {
    e.preventDefault();
    await api.post("/vehicles", form);
    setOpen(false);
    setForm(empty);
    load();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Assets</div>
          <h1>Fleet</h1>
        </div>
        <div className="toolbar">
          <input placeholder="Search registration or make" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} style={{ width: 240 }} />
          <button className="btn btn-pine btn-sm" onClick={load}>Search</button>
          {canEdit && <button className="btn btn-copper btn-sm" onClick={() => setOpen(true)}>Add vehicle</button>}
        </div>
      </div>
      <div className="cards">
        {vehicles.map((v) => (
          <article key={v._id} className="v-card" onClick={() => navigate(`/app/fleet/${v._id}`)}>
            <HealthRing score={v.healthScore} size={78} />
            <div>
              <h3>{v.registration}</h3>
              <p className="muted" style={{ margin: "2px 0 8px" }}>{v.year} {v.make} {v.model}</p>
              <StatusBadge status={v.healthStatus} />
              <div className="muted" style={{ marginTop: 8, fontSize: "0.82rem" }}>
                {v.assignedDriver?.name || "Unassigned"} · {v.mileage?.toLocaleString()} mi
              </div>
            </div>
          </article>
        ))}
      </div>
      {open && (
        <div className="modal-back" onClick={() => setOpen(false)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <h2>New vehicle</h2>
            <div className="form-grid">
              <div><label>Registration</label><input value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} required /></div>
              <div><label>VIN</label><input value={form.vin || ""} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
              <div><label>Make</label><input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required /></div>
              <div><label>Model</label><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required /></div>
              <div><label>Year</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
              <div>
                <label>Fuel</label>
                <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                  <option>petrol</option><option>diesel</option><option>hybrid</option><option>electric</option>
                </select>
              </div>
              <div><label>Mileage</label><input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} /></div>
              <div>
                <label>Driver</label>
                <select value={form.assignedDriver || ""} onChange={(e) => setForm({ ...form, assignedDriver: e.target.value })}>
                  <option value="">Unassigned</option>
                  {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="toolbar" style={{ marginTop: 16 }}>
              <button className="btn btn-copper" type="submit">Save</button>
              <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
