import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

export default function Landing() {
  return (
    <div className="landing">
      <header className="nav-public">
        <Logo wordmark size={40} />
        <nav>
          <a href="#pulse">Health</a>
          <a href="#workshop">Workshop</a>
          <Link to="/login">Sign in</Link>
          <Link to="/register" className="btn btn-copper btn-sm">Open a desk</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <div className="kicker">Fleet vital signs</div>
          <h1>Keep every vehicle honest, roadworthy and paid for.</h1>
          <p className="lede">
            DriveControl is the control room for vehicle health: live component scores, MOT and service clocks,
            workshop authorisation, invoices, and card payments — in one pine-and-copper desk.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-copper">Start with the demo fleet</Link>
            <Link to="/login" className="btn btn-ghost">I already have a desk</Link>
          </div>
        </div>
        <aside className="hero-card">
          <img src="/logo.png" alt="" />
          <p className="kicker" style={{ marginTop: 16 }}>Today across the yard</p>
          <div className="stat-row">
            <div><strong>82</strong><span>avg health</span></div>
            <div><strong>2</strong><span>VOR holds</span></div>
            <div><strong>£286</strong><span>awaiting pay</span></div>
          </div>
        </aside>
      </section>

      <section className="band" id="pulse">
        <h2>What the desk actually runs</h2>
        <div className="grid-3">
          <article className="feature">
            <div className="kicker">Health</div>
            <h3>Component pulse</h3>
            <p className="muted">Engine, brakes, tyres, battery and cooling scored from scans. Overdue MOT, tax and insurance pull a vehicle off the road automatically.</p>
          </article>
          <article className="feature" id="workshop">
            <div className="kicker">Service</div>
            <h3>Book → workshop → invoice</h3>
            <p className="muted">Drivers request work. Garages convert bookings to job cards, add labour and parts, and fleet managers authorise spend.</p>
          </article>
          <article className="feature">
            <div className="kicker">Pay</div>
            <h3>Card desk</h3>
            <p className="muted">Pay invoices with a demo card instantly, or connect Stripe test keys for hosted checkout. Receipts stay on the vehicle file.</p>
          </article>
        </div>
      </section>

      <footer className="landing-foot">
        <span>DriveControl · original MERN platform</span>
        <span>Free MongoDB · Stripe-ready</span>
      </footer>
    </div>
  );
}
