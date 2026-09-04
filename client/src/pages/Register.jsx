import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "fleet_manager", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/app" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(form);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-art">
        <Logo wordmark size={48} />
        <div>
          <div className="kicker">New desk</div>
          <h1>Open your control room.</h1>
          <p>Fleet, garage or driver — same platform, different keys.</p>
        </div>
      </div>
      <div className="auth-form">
        <form className="card" onSubmit={submit}>
          <h2>Create account</h2>
          <label>Full name</label>
          <input value={form.name} onChange={set("name")} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={set("email")} required />
          <label>Password</label>
          <input type="password" value={form.password} onChange={set("password")} minLength={6} required />
          <label>Role</label>
          <select value={form.role} onChange={set("role")}>
            <option value="fleet_manager">Fleet manager</option>
            <option value="garage">Garage</option>
            <option value="driver">Driver</option>
          </select>
          <label>Phone</label>
          <input value={form.phone} onChange={set("phone")} />
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-pine" style={{ width: "100%", marginTop: 18 }} disabled={busy}>
            {busy ? "Opening…" : "Create desk"}
          </button>
          <p className="muted" style={{ marginTop: 16 }}>
            Already set up? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
