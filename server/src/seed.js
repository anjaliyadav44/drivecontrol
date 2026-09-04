import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import User from "./models/User.js";
import Vehicle from "./models/Vehicle.js";
import Garage from "./models/Garage.js";
import Booking from "./models/Booking.js";
import WorkOrder from "./models/WorkOrder.js";
import Invoice from "./models/Invoice.js";
import Payment from "./models/Payment.js";
import HealthLog from "./models/HealthLog.js";
import Notification from "./models/Notification.js";
import { computeHealth } from "./utils/health.js";

const days = (n) => new Date(Date.now() + n * 86400000);

export async function seedIfEmpty() {
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Garage.deleteMany({}),
    Booking.deleteMany({}),
    WorkOrder.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    HealthLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const [admin, fleet, garageUser, driverA, driverB, driverC] = await User.create([
    { name: "Amelia Crowe", email: "admin@drivecontrol.app", password: "Demo1234", role: "admin", phone: "020 7946 0010" },
    { name: "Noah Patel", email: "fleet@drivecontrol.app", password: "Demo1234", role: "fleet_manager", phone: "020 7946 0011" },
    { name: "Sofia Rahman", email: "garage@drivecontrol.app", password: "Demo1234", role: "garage", phone: "0161 496 0100" },
    { name: "James Okonkwo", email: "driver@drivecontrol.app", password: "Demo1234", role: "driver", phone: "07700 900111", licenceNumber: "OKONJ901234J99AB" },
    { name: "Priya Shah", email: "priya@drivecontrol.app", password: "Demo1234", role: "driver", phone: "07700 900222", licenceNumber: "SHAHP901234P99CD" },
    { name: "Callum Reed", email: "callum@drivecontrol.app", password: "Demo1234", role: "driver", phone: "07700 900333", licenceNumber: "REEDC901234C99EF" },
  ]);

  const [grove, mill, harbour] = await Garage.create([
    { name: "Grove Street Motors", town: "Manchester", postcode: "M1 2AB", phone: "0161 496 0100", email: "desk@grovestreet.example", specialties: ["diagnostics", "EV", "MOT"], rating: 4.8, capacity: 10 },
    { name: "Mill Lane Service", town: "Leeds", postcode: "LS1 4DY", phone: "0113 496 0200", email: "book@milllane.example", specialties: ["tyres", "brakes", "service"], rating: 4.5, capacity: 6 },
    { name: "Harbour Auto Health", town: "Bristol", postcode: "BS1 5AH", phone: "0117 496 0300", email: "hello@harbourauto.example", specialties: ["bodywork", "hybrid", "fleet"], rating: 4.7, capacity: 8 },
  ]);

  garageUser.garageId = grove._id;
  await garageUser.save();

  const specs = [
    { registration: "DC21 AMY", make: "Volvo", model: "XC60", year: 2021, color: "Pine", fuelType: "hybrid", mileage: 41200, assignedDriver: driverA._id, preferredGarage: grove._id, components: { engine: 91, transmission: 88, brakes: 54, tires: 61, battery: 84, cooling: 90, electrics: 86 }, motDue: days(40), serviceDue: days(-4), insuranceDue: days(70), taxDue: days(18), vor: false },
    { registration: "DC22 NPT", make: "Tesla", model: "Model Y", year: 2022, color: "Pearl", fuelType: "electric", mileage: 28110, assignedDriver: driverB._id, preferredGarage: grove._id, components: { engine: 95, transmission: 94, brakes: 88, tires: 72, battery: 81, cooling: 93, electrics: 90 }, motDue: days(120), serviceDue: days(35), insuranceDue: days(200), taxDue: days(90), vor: false },
    { registration: "DC19 CLM", make: "Ford", model: "Transit", year: 2019, color: "White", fuelType: "diesel", mileage: 98440, assignedDriver: driverC._id, preferredGarage: mill._id, components: { engine: 48, transmission: 62, brakes: 41, tires: 38, battery: 55, cooling: 44, electrics: 70 }, motDue: days(-12), serviceDue: days(-30), insuranceDue: days(12), taxDue: days(-2), vor: true },
    { registration: "DC23 KEA", make: "Kia", model: "Niro", year: 2023, color: "Copper", fuelType: "hybrid", mileage: 15420, assignedDriver: driverA._id, preferredGarage: harbour._id, components: { engine: 92, transmission: 91, brakes: 89, tires: 86, battery: 94, cooling: 90, electrics: 93 }, motDue: days(260), serviceDue: days(80), insuranceDue: days(140), taxDue: days(100), vor: false },
    { registration: "DC18 VWG", make: "Volkswagen", model: "Caddy", year: 2018, color: "Ink", fuelType: "diesel", mileage: 112300, assignedDriver: driverB._id, preferredGarage: mill._id, components: { engine: 67, transmission: 71, brakes: 58, tires: 64, battery: 60, cooling: 69, electrics: 74 }, motDue: days(8), serviceDue: days(2), insuranceDue: days(45), taxDue: days(22), vor: false },
    { registration: "DC24 POL", make: "Polestar", model: "2", year: 2024, color: "Storm", fuelType: "electric", mileage: 8900, assignedDriver: driverC._id, preferredGarage: grove._id, components: { engine: 97, transmission: 96, brakes: 91, tires: 88, battery: 93, cooling: 95, electrics: 94 }, motDue: days(400), serviceDue: days(110), insuranceDue: days(180), taxDue: days(150), vor: false },
    { registration: "DC20 AUD", make: "Audi", model: "A4", year: 2020, color: "Graphite", fuelType: "petrol", mileage: 62300, assignedDriver: driverA._id, preferredGarage: harbour._id, components: { engine: 76, transmission: 80, brakes: 69, tires: 52, battery: 73, cooling: 78, electrics: 81 }, motDue: days(15), serviceDue: days(9), insuranceDue: days(33), taxDue: days(50), vor: false },
    { registration: "DC17 MER", make: "Mercedes-Benz", model: "Sprinter", year: 2017, color: "Silver", fuelType: "diesel", mileage: 148900, assignedDriver: driverC._id, preferredGarage: mill._id, components: { engine: 36, transmission: 49, brakes: 33, tires: 44, battery: 40, cooling: 38, electrics: 55 }, motDue: days(-40), serviceDue: days(-18), insuranceDue: days(-5), taxDue: days(4), vor: true },
  ];

  const vehicles = [];
  for (const spec of specs) {
    const health = computeHealth(spec);
    const vehicle = await Vehicle.create({
      ...spec,
      healthScore: health.score,
      healthStatus: health.status,
      lastServiceAt: days(-90),
      documents: [
        { name: "Latest MOT certificate", kind: "mot" },
        { name: "Fleet insurance schedule", kind: "insurance" },
      ],
    });
    vehicles.push(vehicle);
    await HealthLog.create({
      vehicle: vehicle._id,
      source: "scan",
      mileage: spec.mileage,
      components: spec.components,
      score: health.score,
      notes: "Onboard diagnostic snapshot imported at seed.",
      recordedBy: fleet._id,
    });
  }

  const [b1, b2, b3] = await Booking.create([
    { reference: "BK-SEED-01", vehicle: vehicles[0]._id, garage: grove._id, driver: driverA._id, createdBy: fleet._id, serviceType: "repair", scheduledAt: days(2), status: "confirmed", symptoms: "Soft brake pedal and uneven pad wear on the XC60." },
    { reference: "BK-SEED-02", vehicle: vehicles[2]._id, garage: mill._id, driver: driverC._id, createdBy: fleet._id, serviceType: "diagnostics", scheduledAt: days(1), status: "confirmed", symptoms: "Transit overheating on motorway runs. VOR until cleared." },
    { reference: "BK-SEED-03", vehicle: vehicles[4]._id, garage: mill._id, driver: driverB._id, createdBy: driverB._id, serviceType: "mot", scheduledAt: days(5), status: "requested", symptoms: "Annual MOT and oil service." },
  ]);

  const wo1 = await WorkOrder.create({
    reference: "WO-SEED-01",
    booking: b1._id,
    vehicle: vehicles[0]._id,
    garage: grove._id,
    technician: garageUser._id,
    status: "awaiting_auth",
    complaint: "Brake performance below fleet threshold.",
    findings: "Front pads at 3mm. Recommend discs and fluid flush.",
    lines: [
      { description: "Front brake pads (OEM)", kind: "parts", qty: 1, unitPrice: 86, authorised: false },
      { description: "Front discs pair", kind: "parts", qty: 1, unitPrice: 164, authorised: false },
      { description: "Labour — brake job 2.5h", kind: "labour", qty: 2.5, unitPrice: 72, authorised: false },
    ],
  });

  const wo2 = await WorkOrder.create({
    reference: "WO-SEED-02",
    booking: b2._id,
    vehicle: vehicles[2]._id,
    garage: mill._id,
    technician: garageUser._id,
    status: "in_progress",
    complaint: "Overheating / VOR",
    findings: "Thermostat sticking. Coolant contaminated.",
    startedAt: days(-1),
    lines: [
      { description: "Thermostat housing", kind: "parts", qty: 1, unitPrice: 118, authorised: true },
      { description: "Coolant flush", kind: "labour", qty: 1.5, unitPrice: 68, authorised: true },
    ],
  });

  const wo3 = await WorkOrder.create({
    reference: "WO-SEED-03",
    vehicle: vehicles[6]._id,
    garage: harbour._id,
    status: "ready",
    complaint: "Tyre replacement after health scan.",
    findings: "Two rear tyres below 2mm.",
    completedAt: days(-1),
    lines: [
      { description: "Rear tyres 225/50 R17", kind: "parts", qty: 2, unitPrice: 95, authorised: true },
      { description: "Fitting and balance", kind: "labour", qty: 1, unitPrice: 48, authorised: true },
    ],
  });

  const invoiceReady = await Invoice.create({
    number: "DC-00101",
    workOrder: wo3._id,
    vehicle: vehicles[6]._id,
    garage: harbour._id,
    billedTo: driverA._id,
    items: wo3.lines.map((l) => ({ description: l.description, qty: l.qty, unitPrice: l.unitPrice })),
    subtotal: 238,
    tax: 47.6,
    total: 285.6,
    dueDate: days(10),
    status: "issued",
  });
  wo3.status = "invoiced";
  await wo3.save();

  const paidInvoice = await Invoice.create({
    number: "DC-00100",
    vehicle: vehicles[5]._id,
    garage: grove._id,
    billedTo: driverC._id,
    items: [{ description: "Health scan and cabin filter", qty: 1, unitPrice: 90 }],
    subtotal: 90,
    tax: 18,
    total: 108,
    dueDate: days(-3),
    status: "paid",
    paidAt: days(-2),
  });

  await Payment.create({
    invoice: paidInvoice._id,
    amount: 108,
    method: "demo",
    status: "succeeded",
    last4: "4242",
    paidBy: fleet._id,
  });

  await Notification.create([
    { title: "VOR: DC19 CLM", body: "Transit is off the road — cooling and tyres below threshold.", kind: "health", link: "/app/fleet" },
    { title: "Authorisation waiting", body: "Grove Street Motors submitted brake lines on DC21 AMY.", kind: "booking", link: "/app/work-orders" },
    { title: "Invoice DC-00101 issued", body: "Tyre work on DC20 AUD is ready to collect payment.", kind: "invoice", link: "/app/invoices" },
  ]);

  console.log("Seeded DriveControl demo data.");
  console.log("  admin@drivecontrol.app / Demo1234");
  console.log("  fleet@drivecontrol.app / Demo1234");
  console.log("  garage@drivecontrol.app / Demo1234");
  console.log("  driver@drivecontrol.app / Demo1234");
  return { admin, fleet, wo1, wo2, invoiceReady };
}

const runningDirect = process.argv[1]?.includes("seed.js");
if (runningDirect) {
  connectDb()
    .then(() => seedIfEmpty())
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
