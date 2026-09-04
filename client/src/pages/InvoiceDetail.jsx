import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { dateFmt, money } from "../components/format.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    api.get(`/invoices/${id}`).then((r) => setInvoice(r.data.invoice));
  }, [id]);

  if (!invoice) return <p className="muted">Opening invoice…</p>;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">Invoice</div>
          <h1>{invoice.number}</h1>
          <p className="muted">{invoice.vehicle?.registration} · due {dateFmt(invoice.dueDate)}</p>
        </div>
        <div className="toolbar">
          <StatusBadge status={invoice.status} />
          {invoice.status !== "paid" && (
            <button className="btn btn-copper" onClick={() => navigate(`/app/payments?invoice=${invoice._id}`)}>Pay now</button>
          )}
        </div>
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            {invoice.items?.map((it, i) => (
              <tr key={i}>
                <td>{it.description}</td>
                <td>{it.qty}</td>
                <td>{money(it.unitPrice)}</td>
                <td>{money(it.qty * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Subtotal {money(invoice.subtotal)} · VAT {money(invoice.tax)}</p>
        <h2>{money(invoice.total)}</h2>
      </div>
    </>
  );
}
