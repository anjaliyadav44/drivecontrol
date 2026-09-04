import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Garages() {
  const [garages, setGarages] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", town: "", postcode: "", phone: "", specialties: "service, MOT" });
  const { user } = useAuth();
  const canEdit = ["admin", "fleet_manager"].includes(user?.role);

  async function load() {
    const { data } = await api.get("/garages");
    setGarages(data.garages);
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/garages", { ...form, specialties: form.specialties.split(",").map((s) => s.trim()) });
    setOpen(false);
    load();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Network</div>
          <h1>Garages</h1>
        </div>
        {canEdit && <button className="btn btn-copper" onClick={() => setOpen(true)}>Add garage</button>}
      </div>
      <div className="cards">
        {garages.map((g) => (
          <article key={g._id} className="v-card" style={{ cursor: "default" }}>
            <div>
              <h3>{g.name}</h3>
              <p className="muted">{g.town} {g.postcode}</p>
              <p>{g.phone}</p>
              <p className="muted">{(g.specialties || []).join(" · ")}</p>
              <p>Rating {g.rating} · Capacity {g.capacity} bays</p>
            </div>
          </article>
        ))}
      </div>
      {open && (
        <div className="modal-back" onClick={() => setOpen(false)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <h2>Network garage</h2>
            <label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label>Town</label><input value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} />
            <label>Postcode</label><input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
            <label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <label>Specialties</label><input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
            <button className="btn btn-copper" style={{ marginTop: 16 }}>Save</button>
          </form>
        </div>
      )}
    </>
  );
}
