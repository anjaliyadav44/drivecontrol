import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const demos = [
  { label: "Fleet manager", email: "fleet@drivecontrol.app" },
  { label: "Garage", email: "garage@drivecontrol.app" },
  { label: "Driver", email: "driver@drivecontrol.app" },
  { label: "Admin", email: "admin@drivecontrol.app" },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("fleet@drivecontrol.app");
  const [password, setPassword] = useState("Demo1234");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-art">
        <Logo wordmark size={48} />
        <div>
          <div className="kicker">Control room</div>
          <h1>Sign in to the yard.</h1>
          <p>Demo password for every seeded desk: Demo1234</p>
        </div>
        <p className="muted">Pine grove · copper pulse</p>
      </div>
      <div className="auth-form">
        <form className="card" onSubmit={submit}>
          <h2>Welcome back</h2>
          <p className="muted">Use a demo desk or your own account.</p>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-copper" style={{ width: "100%", marginTop: 18 }} disabled={busy}>
            {busy ? "Checking…" : "Enter DriveControl"}
          </button>
          <div className="demo-accounts">
            {demos.map((d) => (
              <button key={d.email} type="button" onClick={() => setEmail(d.email)}>
                <strong>{d.label}</strong>
                <div>{d.email}</div>
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 16 }}>
            New here? <Link to="/register">Create a desk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
