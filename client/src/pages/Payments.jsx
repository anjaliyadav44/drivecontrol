import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import { dateFmt, money } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

export default function Payments() {
  const [params] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [invoiceId, setInvoiceId] = useState(params.get("invoice") || "");
  const [card, setCard] = useState({ name: "Noah Patel", number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [inv, pay] = await Promise.all([api.get("/invoices"), api.get("/payments")]);
    setInvoices(inv.data.invoices);
    setPayments(pay.data.payments);
    setStripeEnabled(pay.data.stripeEnabled);
    if (!invoiceId) {
      const due = inv.data.invoices.find((i) => i.status === "issued");
      if (due) setInvoiceId(due._id);
    }
  }
  useEffect(() => { load(); }, []);

  const selected = useMemo(() => invoices.find((i) => i._id === invoiceId), [invoices, invoiceId]);

  async function payDemo(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.post("/payments/demo", { invoiceId, cardNumber: card.number });
      setMessage("Payment captured. Invoice marked paid.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  async function payStripe() {
    setBusy(true);
    setMessage("");
    try {
      const { data } = await api.post("/payments/checkout", { invoiceId });
      window.location.href = data.url;
    } catch (err) {
      setMessage(err.response?.data?.message || "Stripe is not configured");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Card desk</div>
          <h1>Payments</h1>
        </div>
      </div>
      <div className="pay-grid">
        <form className="panel" onSubmit={payDemo}>
          <h3>Pay an invoice</h3>
          <label>Invoice</label>
          <select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
            <option value="">Select</option>
            {invoices.map((i) => (
              <option key={i._id} value={i._id}>
                {i.number} · {i.vehicle?.registration} · {money(i.total)} ({i.status})
              </option>
            ))}
          </select>
          {selected && <p className="muted">Amount due {money(selected.total)}</p>}
          <div className="card-art" style={{ margin: "16px 0" }}>
            <div className="kicker">DriveControl card</div>
            <p style={{ letterSpacing: "0.18em", fontSize: "1.1rem" }}>{card.number}</p>
            <div className="two">
              <span>{card.name}</span>
              <span>{card.expiry}</span>
            </div>
          </div>
          <label>Name on card</label>
          <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
          <label>Card number</label>
          <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
          <div className="two">
            <div><label>Expiry</label><input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} /></div>
            <div><label>CVC</label><input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></div>
          </div>
          {message && <p className={message.includes("failed") || message.includes("not") ? "form-error" : "muted"}>{message}</p>}
          <div className="toolbar" style={{ marginTop: 16 }}>
            <button className="btn btn-copper" disabled={busy || selected?.status === "paid"}>
              {busy ? "Processing…" : "Pay with demo card"}
            </button>
            <button type="button" className="btn btn-pine" disabled={busy || !stripeEnabled} onClick={payStripe}>
              Stripe checkout
            </button>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            Demo mode works with no keys. Add a Stripe test secret to enable hosted checkout.
          </p>
        </form>
        <div className="panel">
          <h3>Ledger</h3>
          <table className="table">
            <thead><tr><th>When</th><th>Method</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>{dateFmt(p.createdAt)}</td>
                  <td>{p.method}{p.last4 ? ` · ${p.last4}` : ""}</td>
                  <td>{money(p.amount)}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
