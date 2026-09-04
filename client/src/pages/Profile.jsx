import { useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    licenceNumber: user?.licenceNumber || "",
  });
  const [saved, setSaved] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const { data } = await api.patch("/auth/me", form);
    setUser(data.user);
    setSaved(true);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Account</div>
          <h1>Your desk</h1>
        </div>
      </div>
      <form className="card" style={{ maxWidth: 480 }} onSubmit={submit}>
        <p className="muted">{user?.email} · {user?.role?.replace("_", " ")}</p>
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <label>Licence number</label>
        <input value={form.licenceNumber} onChange={(e) => setForm({ ...form, licenceNumber: e.target.value })} />
        <button className="btn btn-pine" style={{ marginTop: 16 }}>Save</button>
        {saved && <p className="muted">Saved.</p>}
      </form>
    </>
  );
}
