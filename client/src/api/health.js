export const COMPONENTS = [
  "engine",
  "transmission",
  "brakes",
  "tires",
  "battery",
  "cooling",
  "electrics",
];

export function computeHealth(vehicle) {
  const scores = COMPONENTS.map((key) => Number(vehicle.components?.[key] ?? 80));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const now = Date.now();
  let penalty = 0;
  if (vehicle.motDue && new Date(vehicle.motDue).getTime() < now) penalty += 12;
  if (vehicle.serviceDue && new Date(vehicle.serviceDue).getTime() < now) penalty += 8;
  if (vehicle.insuranceDue && new Date(vehicle.insuranceDue).getTime() < now) penalty += 10;
  const critical = scores.some((s) => s < 40);
  const score = Math.max(0, Math.min(100, Math.round(avg - penalty)));
  let status = "healthy";
  if (critical || score < 40 || vehicle.vor) status = "vor";
  else if (score < 65) status = "attention";
  else if (score < 80) status = "watch";
  return { score, status, critical };
}

export function healthAlerts(vehicle) {
  const alerts = [];
  const now = Date.now();
  for (const key of COMPONENTS) {
    const value = Number(vehicle.components?.[key] ?? 80);
    if (value < 40) alerts.push({ severity: "critical", code: key, message: `${label(key)} is in critical condition (${value}%)` });
    else if (value < 60) alerts.push({ severity: "warning", code: key, message: `${label(key)} needs inspection (${value}%)` });
  }
  const dueSoon = (date, name) => {
    if (!date) return;
    const t = new Date(date).getTime();
    const days = Math.ceil((t - now) / 86400000);
    if (days < 0) alerts.push({ severity: "critical", code: name, message: `${name} is overdue by ${Math.abs(days)} days` });
    else if (days <= 21) alerts.push({ severity: "warning", code: name, message: `${name} due in ${days} days` });
  };
  dueSoon(vehicle.motDue, "MOT");
  dueSoon(vehicle.serviceDue, "Service");
  dueSoon(vehicle.insuranceDue, "Insurance");
  dueSoon(vehicle.taxDue, "Road tax");
  if (vehicle.vor) alerts.push({ severity: "critical", code: "vor", message: "Vehicle is off the road (VOR)" });
  return alerts;
}

function label(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}
