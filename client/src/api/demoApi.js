import { computeHealth, healthAlerts } from "./health.js";

const KEY = "dc_demo_db_v1";
const days = (n) => new Date(Date.now() + n * 86400000).toISOString();
const nid = (p) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

function fail(status, message) {
  const err = new Error(message);
  err.response = { status, data: { message } };
  throw err;
}

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function seed() {
  const users = [
    { _id: "u_admin", name: "Amelia Crowe", email: "admin@drivecontrol.app", password: "Demo1234", role: "admin", phone: "020 7946 0010", active: true },
    { _id: "u_fleet", name: "Noah Patel", email: "fleet@drivecontrol.app", password: "Demo1234", role: "fleet_manager", phone: "020 7946 0011", active: true },
    { _id: "u_garage", name: "Sofia Rahman", email: "garage@drivecontrol.app", password: "Demo1234", role: "garage", phone: "0161 496 0100", garageId: "g_grove", active: true },
    { _id: "u_driver", name: "James Okonkwo", email: "driver@drivecontrol.app", password: "Demo1234", role: "driver", phone: "07700 900111", licenceNumber: "OKONJ901234J99AB", active: true },
    { _id: "u_priya", name: "Priya Shah", email: "priya@drivecontrol.app", password: "Demo1234", role: "driver", phone: "07700 900222", licenceNumber: "SHAHP901234P99CD", active: true },
    { _id: "u_callum", name: "Callum Reed", email: "callum@drivecontrol.app", password: "Demo1234", role: "driver", phone: "07700 900333", licenceNumber: "REEDC901234C99EF", active: true },
  ];
  const garages = [
    { _id: "g_grove", name: "Grove Street Motors", town: "Manchester", postcode: "M1 2AB", phone: "0161 496 0100", specialties: ["diagnostics", "EV", "MOT"], rating: 4.8, capacity: 10 },
    { _id: "g_mill", name: "Mill Lane Service", town: "Leeds", postcode: "LS1 4DY", phone: "0113 496 0200", specialties: ["tyres", "brakes", "service"], rating: 4.5, capacity: 6 },
    { _id: "g_harbour", name: "Harbour Auto Health", town: "Bristol", postcode: "BS1 5AH", phone: "0117 496 0300", specialties: ["bodywork", "hybrid", "fleet"], rating: 4.7, capacity: 8 },
  ];
  const specs = [
    { _id: "v1", registration: "DC21 AMY", make: "Volvo", model: "XC60", year: 2021, fuelType: "hybrid", mileage: 41200, assignedDriver: "u_driver", preferredGarage: "g_grove", components: { engine: 91, transmission: 88, brakes: 54, tires: 61, battery: 84, cooling: 90, electrics: 86 }, motDue: days(40), serviceDue: days(-4), insuranceDue: days(70), taxDue: days(18), vor: false },
    { _id: "v2", registration: "DC22 NPT", make: "Tesla", model: "Model Y", year: 2022, fuelType: "electric", mileage: 28110, assignedDriver: "u_priya", preferredGarage: "g_grove", components: { engine: 95, transmission: 94, brakes: 88, tires: 72, battery: 81, cooling: 93, electrics: 90 }, motDue: days(120), serviceDue: days(35), insuranceDue: days(200), taxDue: days(90), vor: false },
    { _id: "v3", registration: "DC19 CLM", make: "Ford", model: "Transit", year: 2019, fuelType: "diesel", mileage: 98440, assignedDriver: "u_callum", preferredGarage: "g_mill", components: { engine: 48, transmission: 62, brakes: 41, tires: 38, battery: 55, cooling: 44, electrics: 70 }, motDue: days(-12), serviceDue: days(-30), insuranceDue: days(12), taxDue: days(-2), vor: true },
    { _id: "v4", registration: "DC23 KEA", make: "Kia", model: "Niro", year: 2023, fuelType: "hybrid", mileage: 15420, assignedDriver: "u_driver", preferredGarage: "g_harbour", components: { engine: 92, transmission: 91, brakes: 89, tires: 86, battery: 94, cooling: 90, electrics: 93 }, motDue: days(260), serviceDue: days(80), insuranceDue: days(140), taxDue: days(100), vor: false },
    { _id: "v5", registration: "DC18 VWG", make: "Volkswagen", model: "Caddy", year: 2018, fuelType: "diesel", mileage: 112300, assignedDriver: "u_priya", preferredGarage: "g_mill", components: { engine: 67, transmission: 71, brakes: 58, tires: 64, battery: 60, cooling: 69, electrics: 74 }, motDue: days(8), serviceDue: days(2), insuranceDue: days(45), taxDue: days(22), vor: false },
    { _id: "v6", registration: "DC24 POL", make: "Polestar", model: "2", year: 2024, fuelType: "electric", mileage: 8900, assignedDriver: "u_callum", preferredGarage: "g_grove", components: { engine: 97, transmission: 96, brakes: 91, tires: 88, battery: 93, cooling: 95, electrics: 94 }, motDue: days(400), serviceDue: days(110), insuranceDue: days(180), taxDue: days(150), vor: false },
    { _id: "v7", registration: "DC20 AUD", make: "Audi", model: "A4", year: 2020, fuelType: "petrol", mileage: 62300, assignedDriver: "u_driver", preferredGarage: "g_harbour", components: { engine: 76, transmission: 80, brakes: 69, tires: 52, battery: 73, cooling: 78, electrics: 81 }, motDue: days(15), serviceDue: days(9), insuranceDue: days(33), taxDue: days(50), vor: false },
    { _id: "v8", registration: "DC17 MER", make: "Mercedes-Benz", model: "Sprinter", year: 2017, fuelType: "diesel", mileage: 148900, assignedDriver: "u_callum", preferredGarage: "g_mill", components: { engine: 36, transmission: 49, brakes: 33, tires: 44, battery: 40, cooling: 38, electrics: 55 }, motDue: days(-40), serviceDue: days(-18), insuranceDue: days(-5), taxDue: days(4), vor: true },
  ];
  const vehicles = specs.map((s) => {
    const health = computeHealth(s);
    return { ...s, healthScore: health.score, healthStatus: health.status, lastServiceAt: days(-90), documents: [{ name: "Latest MOT certificate", kind: "mot" }, { name: "Fleet insurance schedule", kind: "insurance" }] };
  });
  const logs = vehicles.map((v) => ({ _id: nid("log"), vehicle: v._id, source: "scan", mileage: v.mileage, components: v.components, score: v.healthScore, notes: "Onboard diagnostic snapshot.", createdAt: new Date().toISOString() }));
  const bookings = [
    { _id: "b1", reference: "BK-SEED-01", vehicle: "v1", garage: "g_grove", driver: "u_driver", serviceType: "repair", scheduledAt: days(2), status: "confirmed", symptoms: "Soft brake pedal on the XC60." },
    { _id: "b2", reference: "BK-SEED-02", vehicle: "v3", garage: "g_mill", driver: "u_callum", serviceType: "diagnostics", scheduledAt: days(1), status: "confirmed", symptoms: "Transit overheating. VOR until cleared." },
    { _id: "b3", reference: "BK-SEED-03", vehicle: "v5", garage: "g_mill", driver: "u_priya", serviceType: "mot", scheduledAt: days(5), status: "requested", symptoms: "Annual MOT and oil service." },
  ];
  const workOrders = [
    { _id: "w1", reference: "WO-SEED-01", booking: "b1", vehicle: "v1", garage: "g_grove", technician: "u_garage", status: "awaiting_auth", complaint: "Brake performance below fleet threshold.", findings: "Front pads at 3mm.", lines: [{ _id: "l1", description: "Front brake pads (OEM)", kind: "parts", qty: 1, unitPrice: 86, authorised: false }, { _id: "l2", description: "Front discs pair", kind: "parts", qty: 1, unitPrice: 164, authorised: false }, { _id: "l3", description: "Labour — brake job 2.5h", kind: "labour", qty: 2.5, unitPrice: 72, authorised: false }] },
    { _id: "w2", reference: "WO-SEED-02", booking: "b2", vehicle: "v3", garage: "g_mill", technician: "u_garage", status: "in_progress", complaint: "Overheating / VOR", findings: "Thermostat sticking.", startedAt: days(-1), lines: [{ _id: "l4", description: "Thermostat housing", kind: "parts", qty: 1, unitPrice: 118, authorised: true }, { _id: "l5", description: "Coolant flush", kind: "labour", qty: 1.5, unitPrice: 68, authorised: true }] },
    { _id: "w3", reference: "WO-SEED-03", vehicle: "v7", garage: "g_harbour", status: "invoiced", complaint: "Tyre replacement.", findings: "Two rear tyres below 2mm.", completedAt: days(-1), lines: [{ _id: "l6", description: "Rear tyres 225/50 R17", kind: "parts", qty: 2, unitPrice: 95, authorised: true }, { _id: "l7", description: "Fitting and balance", kind: "labour", qty: 1, unitPrice: 48, authorised: true }] },
  ];
  const invoices = [
    { _id: "i1", number: "DC-00101", workOrder: "w3", vehicle: "v7", garage: "g_harbour", billedTo: "u_driver", items: [{ description: "Rear tyres 225/50 R17", qty: 2, unitPrice: 95 }, { description: "Fitting and balance", qty: 1, unitPrice: 48 }], subtotal: 238, tax: 47.6, total: 285.6, dueDate: days(10), status: "issued" },
    { _id: "i2", number: "DC-00100", vehicle: "v6", garage: "g_grove", billedTo: "u_callum", items: [{ description: "Health scan and cabin filter", qty: 1, unitPrice: 90 }], subtotal: 90, tax: 18, total: 108, dueDate: days(-3), status: "paid", paidAt: days(-2) },
  ];
  const payments = [{ _id: "p1", invoice: "i2", amount: 108, method: "demo", status: "succeeded", last4: "4242", paidBy: "u_fleet", createdAt: days(-2) }];
  return { users, garages, vehicles, logs, bookings, workOrders, invoices, payments };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const db = seed();
  save(db);
  return db;
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function currentUser(db) {
  const token = localStorage.getItem("dc_token") || "";
  const id = token.startsWith("demo.") ? token.slice(5) : "";
  return db.users.find((u) => u._id === id) || null;
}

function needUser(db) {
  const user = currentUser(db);
  if (!user) fail(401, "Sign in required");
  return user;
}

function popUser(db, id) {
  const u = db.users.find((x) => x._id === id);
  return u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone, licenceNumber: u.licenceNumber } : null;
}

function popGarage(db, id) {
  return db.garages.find((g) => g._id === id) || null;
}

function popVehicle(db, id, full = false) {
  const v = db.vehicles.find((x) => x._id === id);
  if (!v) return null;
  if (full) {
    return { ...v, assignedDriver: popUser(db, v.assignedDriver), preferredGarage: popGarage(db, v.preferredGarage) };
  }
  return { _id: v._id, registration: v.registration, make: v.make, model: v.model, healthScore: v.healthScore };
}

function hydrateBooking(db, b) {
  return { ...b, vehicle: popVehicle(db, b.vehicle), garage: popGarage(db, b.garage), driver: popUser(db, b.driver) };
}

function hydrateWo(db, w, full = false) {
  return {
    ...w,
    vehicle: full ? popVehicle(db, w.vehicle, true) : popVehicle(db, w.vehicle),
    garage: popGarage(db, w.garage),
    technician: popUser(db, w.technician),
    booking: db.bookings.find((b) => b._id === w.booking) || null,
  };
}

function hydrateInvoice(db, inv, full = false) {
  return {
    ...inv,
    vehicle: full ? popVehicle(db, inv.vehicle, true) : popVehicle(db, inv.vehicle),
    garage: popGarage(db, inv.garage),
    billedTo: popUser(db, inv.billedTo),
    workOrder: full ? db.workOrders.find((w) => w._id === inv.workOrder) : inv.workOrder,
  };
}

async function handle(method, url, body, config) {
  const db = load();
  const path = url.split("?")[0].replace(/^\//, "");
  const parts = path.split("/").filter(Boolean);
  const params = config?.params || {};
  const q = (params.q || "").toLowerCase();

  if (parts[0] === "auth" && parts[1] === "login" && method === "post") {
    const user = db.users.find((u) => u.email === (body.email || "").toLowerCase());
    if (!user || user.password !== body.password) fail(401, "Invalid email or password");
    return { token: `demo.${user._id}`, user: publicUser(user) };
  }
  if (parts[0] === "auth" && parts[1] === "register" && method === "post") {
    if (!body.name || !body.email || !body.password) fail(400, "Name, email and password are required");
    if (db.users.some((u) => u.email === body.email.toLowerCase())) fail(409, "An account with this email already exists");
    const role = ["fleet_manager", "garage", "driver"].includes(body.role) ? body.role : "driver";
    const user = { _id: nid("u"), name: body.name, email: body.email.toLowerCase(), password: body.password, role, phone: body.phone, active: true };
    db.users.push(user);
    save(db);
    return { token: `demo.${user._id}`, user: publicUser(user) };
  }
  if (parts[0] === "auth" && parts[1] === "me" && method === "get") {
    return { user: publicUser(needUser(db)) };
  }
  if (parts[0] === "auth" && parts[1] === "me" && method === "patch") {
    const user = needUser(db);
    Object.assign(user, { name: body.name ?? user.name, phone: body.phone ?? user.phone, licenceNumber: body.licenceNumber ?? user.licenceNumber });
    save(db);
    return { user: publicUser(user) };
  }

  const me = needUser(db);

  if (parts[0] === "dashboard" && method === "get") {
    const vehicles = me.role === "driver" ? db.vehicles.filter((v) => v.assignedDriver === me._id) : db.vehicles;
    const bookings = db.bookings.filter((b) => ["requested", "confirmed"].includes(b.status)).slice(0, 8).map((b) => hydrateBooking(db, b));
    const workOrders = db.workOrders.filter((w) => w.status !== "invoiced").slice(0, 8).map((w) => hydrateWo(db, w));
    const invoices = db.invoices.filter((i) => i.status === "issued").map((i) => hydrateInvoice(db, i));
    const outstanding = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const avgHealth = vehicles.length ? Math.round(vehicles.reduce((s, v) => s + v.healthScore, 0) / vehicles.length) : 0;
    const criticalAlerts = vehicles.flatMap((v) => healthAlerts(v).filter((a) => a.severity === "critical").map((a) => ({ ...a, registration: v.registration, vehicleId: v._id })));
    return {
      kpis: { fleetSize: vehicles.length, avgHealth, vor: vehicles.filter((v) => v.healthStatus === "vor").length, openBookings: bookings.length, openWork: workOrders.length, outstanding, drivers: db.users.filter((u) => u.role === "driver").length },
      vehicles, bookings, workOrders, invoices, criticalAlerts,
    };
  }

  if (parts[0] === "health" && parts[1] === "overview") {
    const vehicles = me.role === "driver" ? db.vehicles.filter((v) => v.assignedDriver === me._id) : db.vehicles;
    const alerts = vehicles.flatMap((v) => healthAlerts(v).map((a) => ({ ...a, vehicleId: v._id, registration: v.registration, make: v.make, model: v.model })));
    return {
      alerts: alerts.sort((a, b) => (a.severity === "critical" ? -1 : 1)),
      logs: db.logs.slice(0, 12).map((l) => ({ ...l, vehicle: popVehicle(db, l.vehicle) })),
      counts: {
        healthy: vehicles.filter((v) => v.healthStatus === "healthy").length,
        watch: vehicles.filter((v) => v.healthStatus === "watch").length,
        attention: vehicles.filter((v) => v.healthStatus === "attention").length,
        vor: vehicles.filter((v) => v.healthStatus === "vor").length,
      },
    };
  }

  if (parts[0] === "vehicles" && parts.length === 1 && method === "get") {
    let list = me.role === "driver" ? db.vehicles.filter((v) => v.assignedDriver === me._id) : db.vehicles;
    if (q) list = list.filter((v) => `${v.registration} ${v.make} ${v.model}`.toLowerCase().includes(q));
    if (params.status) list = list.filter((v) => v.healthStatus === params.status);
    list = [...list].sort((a, b) => a.healthScore - b.healthScore);
    return { vehicles: list.map((v) => ({ ...v, assignedDriver: popUser(db, v.assignedDriver), preferredGarage: popGarage(db, v.preferredGarage), alerts: healthAlerts(v) })) };
  }
  if (parts[0] === "vehicles" && parts.length === 1 && method === "post") {
    const vehicle = { _id: nid("v"), ...body, documents: [] };
    const health = computeHealth(vehicle);
    Object.assign(vehicle, { healthScore: health.score, healthStatus: health.status });
    db.vehicles.push(vehicle);
    save(db);
    return { vehicle };
  }
  if (parts[0] === "vehicles" && parts[1] && method === "get" && !parts[2]) {
    const vehicle = popVehicle(db, parts[1], true);
    if (!vehicle) fail(404, "Vehicle not found");
    const logs = db.logs.filter((l) => l.vehicle === parts[1]).slice(0, 20);
    return { vehicle, alerts: healthAlerts(vehicle), logs };
  }
  if (parts[0] === "vehicles" && parts[2] === "scan" && method === "post") {
    const vehicle = db.vehicles.find((v) => v._id === parts[1]);
    if (!vehicle) fail(404, "Vehicle not found");
    vehicle.components = { ...vehicle.components, ...body.components };
    if (body.mileage) vehicle.mileage = body.mileage;
    const health = computeHealth(vehicle);
    vehicle.healthScore = health.score;
    vehicle.healthStatus = health.status;
    const log = { _id: nid("log"), vehicle: vehicle._id, source: "scan", mileage: vehicle.mileage, components: vehicle.components, score: health.score, notes: body.notes, createdAt: new Date().toISOString() };
    db.logs.unshift(log);
    save(db);
    return { vehicle, log, alerts: healthAlerts(vehicle) };
  }
  if (parts[0] === "vehicles" && parts[2] === "documents" && method === "post") {
    const vehicle = db.vehicles.find((v) => v._id === parts[1]);
    vehicle.documents = vehicle.documents || [];
    vehicle.documents.push({ name: body.name, kind: body.kind || "other" });
    save(db);
    return { vehicle };
  }
  if (parts[0] === "vehicles" && method === "patch") {
    const vehicle = db.vehicles.find((v) => v._id === parts[1]);
    if (!vehicle) fail(404, "Vehicle not found");
    Object.assign(vehicle, body);
    const health = computeHealth(vehicle);
    vehicle.healthScore = health.score;
    vehicle.healthStatus = health.status;
    save(db);
    return { vehicle, alerts: healthAlerts(vehicle) };
  }

  if (parts[0] === "garages" && method === "get") {
    return { garages: db.garages };
  }
  if (parts[0] === "garages" && method === "post") {
    const garage = { _id: nid("g"), rating: 4.5, capacity: 6, ...body };
    db.garages.push(garage);
    save(db);
    return { garage };
  }

  if (parts[0] === "users" && method === "get") {
    let list = db.users.map(publicUser);
    if (params.role) list = list.filter((u) => u.role === params.role);
    return { users: list };
  }

  if (parts[0] === "bookings" && parts.length === 1 && method === "get") {
    let list = db.bookings;
    if (me.role === "driver") list = list.filter((b) => b.driver === me._id);
    return { bookings: list.map((b) => hydrateBooking(db, b)) };
  }
  if (parts[0] === "bookings" && parts.length === 1 && method === "post") {
    const booking = { _id: nid("b"), reference: `BK-${Date.now().toString(36).toUpperCase()}`, status: "requested", driver: body.driver || (me.role === "driver" ? me._id : undefined), ...body };
    db.bookings.push(booking);
    save(db);
    return { booking: hydrateBooking(db, booking) };
  }
  if (parts[0] === "bookings" && parts[2] === "convert" && method === "post") {
    const booking = db.bookings.find((b) => b._id === parts[1]);
    booking.status = "converted";
    const workOrder = { _id: nid("w"), reference: `WO-${Date.now().toString(36).toUpperCase()}`, booking: booking._id, vehicle: booking.vehicle, garage: booking.garage, complaint: booking.symptoms, status: "queued", lines: [] };
    db.workOrders.unshift(workOrder);
    save(db);
    return { booking, workOrder };
  }
  if (parts[0] === "bookings" && method === "patch") {
    const booking = db.bookings.find((b) => b._id === parts[1]);
    Object.assign(booking, body);
    save(db);
    return { booking: hydrateBooking(db, booking) };
  }

  if (parts[0] === "work-orders" && parts.length === 1 && method === "get") {
    return { workOrders: db.workOrders.map((w) => hydrateWo(db, w)) };
  }
  if (parts[0] === "work-orders" && parts.length === 2 && method === "get") {
    const workOrder = db.workOrders.find((w) => w._id === parts[1]);
    if (!workOrder) fail(404, "Work order not found");
    return { workOrder: hydrateWo(db, workOrder, true) };
  }
  if (parts[0] === "work-orders" && parts[2] === "lines" && method === "post") {
    const workOrder = db.workOrders.find((w) => w._id === parts[1]);
    workOrder.lines.push({ _id: nid("l"), authorised: false, qty: 1, unitPrice: 0, ...body });
    if (workOrder.lines.some((l) => !l.authorised)) workOrder.status = "awaiting_auth";
    save(db);
    return { workOrder };
  }
  if (parts[0] === "work-orders" && parts[2] === "authorise" && method === "post") {
    const workOrder = db.workOrders.find((w) => w._id === parts[1]);
    workOrder.lines.forEach((l) => { l.authorised = true; });
    workOrder.status = "in_progress";
    save(db);
    return { workOrder };
  }
  if (parts[0] === "work-orders" && parts[2] === "invoice" && method === "post") {
    const workOrder = db.workOrders.find((w) => w._id === parts[1]);
    const items = workOrder.lines.map((l) => ({ description: l.description, qty: l.qty, unitPrice: l.unitPrice }));
    const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const tax = Math.round(subtotal * 0.2 * 100) / 100;
    const invoice = { _id: nid("i"), number: `DC-${String(db.invoices.length + 101).padStart(5, "0")}`, workOrder: workOrder._id, vehicle: workOrder.vehicle, garage: workOrder.garage, billedTo: db.vehicles.find((v) => v._id === workOrder.vehicle)?.assignedDriver, items, subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100, dueDate: days(14), status: "issued" };
    db.invoices.unshift(invoice);
    workOrder.status = "invoiced";
    save(db);
    return { invoice, workOrder };
  }
  if (parts[0] === "work-orders" && method === "patch") {
    const workOrder = db.workOrders.find((w) => w._id === parts[1]);
    Object.assign(workOrder, body);
    save(db);
    return { workOrder };
  }

  if (parts[0] === "invoices" && parts.length === 1 && method === "get") {
    let list = db.invoices;
    if (me.role === "driver") list = list.filter((i) => i.billedTo === me._id);
    return { invoices: list.map((i) => hydrateInvoice(db, i)) };
  }
  if (parts[0] === "invoices" && method === "get") {
    const invoice = db.invoices.find((i) => i._id === parts[1]);
    if (!invoice) fail(404, "Invoice not found");
    return { invoice: hydrateInvoice(db, invoice, true) };
  }

  if (parts[0] === "payments" && method === "get") {
    return {
      stripeEnabled: false,
      payments: db.payments.map((p) => ({ ...p, invoice: hydrateInvoice(db, db.invoices.find((i) => i._id === p.invoice) || { _id: p.invoice }), paidBy: popUser(db, p.paidBy) })),
    };
  }
  if (parts[0] === "payments" && parts[1] === "demo" && method === "post") {
    const invoice = db.invoices.find((i) => i._id === body.invoiceId);
    if (!invoice) fail(404, "Invoice not found");
    if (invoice.status === "paid") fail(400, "Invoice already paid");
    const last4 = String(body.cardNumber || "4242").replace(/\s/g, "").slice(-4);
    const payment = { _id: nid("p"), invoice: invoice._id, amount: invoice.total, method: "demo", status: "succeeded", last4, paidBy: me._id, createdAt: new Date().toISOString() };
    db.payments.unshift(payment);
    invoice.status = "paid";
    invoice.paidAt = new Date().toISOString();
    save(db);
    return { payment, invoice };
  }
  if (parts[0] === "payments" && parts[1] === "checkout" && method === "post") {
    fail(400, "Stripe keys are not configured. Use demo card payment.");
  }

  fail(404, `Route not found: ${method.toUpperCase()} /${path}`);
}

function wrap(method) {
  return async (url, bodyOrConfig, maybeConfig) => {
    const body = method === "get" ? undefined : bodyOrConfig;
    const config = method === "get" ? bodyOrConfig : maybeConfig;
    const data = await handle(method, url, body || {}, config);
    return { data };
  };
}

const demoApi = {
  get: wrap("get"),
  post: wrap("post"),
  patch: wrap("patch"),
  delete: wrap("delete"),
};

export default demoApi;
