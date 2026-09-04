import { statusLabel } from "./format.js";

export function StatusBadge({ status }) {
  return <span className={`pill pill-${status}`}>{statusLabel[status] || status}</span>;
}
