export const statusLabel = {
  healthy: "Healthy",
  watch: "Watch",
  attention: "Attention",
  vor: "Off road",
  requested: "Requested",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  cancelled: "Cancelled",
  converted: "In workshop",
  queued: "Queued",
  in_progress: "In progress",
  awaiting_auth: "Awaiting auth",
  ready: "Ready",
  completed: "Completed",
  invoiced: "Invoiced",
  issued: "Due",
  paid: "Paid",
  void: "Void",
  draft: "Draft",
  succeeded: "Succeeded",
  pending: "Pending",
  failed: "Failed",
};

export function money(n, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n || 0);
}

export function dateFmt(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
