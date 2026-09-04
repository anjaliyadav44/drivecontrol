import { useEffect, useState } from "react";
import api from "../api/client.js";
import { dateFmt } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

const types = ["service", "mot", "repair", "tyres", "diagnostics", "bodywork", "recall"];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [garages, setGarages] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicle: "", garage: "", serviceType: "service", scheduledAt: "", symptoms: "" });

  async function load() {
    const [b, v, g] = await Promise.all([api.get("/bookings"), api.get("/vehicles"), api.get("/garages")]);
    setBookings(b.data.bookings);
    setVehicles(v.data.vehicles);
    setGarages(g.data.garages);
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/bookings", form);
    setOpen(false);
    load();
  }

  async function confirm(id) {
    await api.patch(`/bookings/${id}`, { status: "confirmed" });
    load();
  }

  async function convert(id) {
    await api.post(`/bookings/${id}/convert`);
    load();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Diary</div>
          <h1>Bookings</h1>
        </div>
        <button className="btn btn-copper" onClick={() => setOpen(true)}>New booking</button>
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>Ref</th><th>When</th><th>Vehicle</th><th>Type</th><th>Garage</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.reference}</td>
                <td>{dateFmt(b.scheduledAt)}</td>
                <td>{b.vehicle?.registration}</td>
                <td>{b.serviceType}</td>
                <td>{b.garage?.name}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>
                  {b.status === "requested" && <button className="btn btn-sm btn-pine" onClick={() => confirm(b._id)}>Confirm</button>}
                  {["confirmed", "checked_in"].includes(b.status) && (
                    <button className="btn btn-sm btn-copper" onClick={() => convert(b._id)}>Send to workshop</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="modal-back" onClick={() => setOpen(false)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <h2>Book work</h2>
            <label>Vehicle</label>
            <select required value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
              <option value="">Select</option>
              {vehicles.map((v) => <option key={v._id} value={v._id}>{v.registration} · {v.make} {v.model}</option>)}
            </select>
            <label>Garage</label>
            <select value={form.garage} onChange={(e) => setForm({ ...form, garage: e.target.value })}>
              <option value="">Select</option>
              {garages.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
            <label>Type</label>
            <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
            <label>Date</label>
            <input type="date" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
            <label>Symptoms / notes</label>
            <textarea rows={3} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
            <div className="toolbar" style={{ marginTop: 16 }}>
              <button className="btn btn-copper">Create</button>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
