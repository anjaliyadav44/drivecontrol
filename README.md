# DriveControl

MERN platform for **vehicle health, workshop control, and payments**: fleet vitals, bookings, job cards, authorisation, invoices, and card pay.

## Demo desks

Password for all: `Demo1234`

| Role | Email |
| --- | --- |
| Fleet manager | fleet@drivecontrol.app |
| Garage | garage@drivecontrol.app |
| Driver | driver@drivecontrol.app |
| Admin | admin@drivecontrol.app |

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run install:all
npm run dev
```

- Web: http://localhost:5173 (or 5174 if 5173 is already in use)
- API: http://localhost:5000/api/healthcheck

If nothing is listening on MongoDB `27017`, the API starts a free in-memory database and seeds a demo fleet. Optional Atlas: set `MONGO_URI` in `server/.env`.

## Production

```bash
npm run install:all
npm run build
NODE_ENV=production npm start
```

The Express server serves the React build from `client/dist` on one port.

## Stack

| Layer | Choice |
| --- | --- |
| Web | React 18 + Vite |
| API | Node 22 + Express |
| Database | MongoDB — local, Docker, [Atlas M0 free](https://www.mongodb.com/atlas), or in-memory fallback in development |
| Payments | Demo card desk always on; optional [Stripe test mode](https://dashboard.stripe.com/test/apikeys) |

## Brand

- Logo: copper pulse on pine (`client/public/logo.png`)
- Type: **Syne** (display) + **Outfit** (UI)
- Palette: pine `#0E2A22`, copper `#C4783A`, cream paper `#FBF8F1`

## What you can do

- **Control room** — fleet health average, VOR count, unpaid invoices, alert list
- **Fleet** — add vehicles, assign drivers, component scores, MOT/tax/insurance clocks, VOR flag, document records, diagnostic scans
- **Health centre** — aggregated alerts and scan history
- **Bookings** — service / MOT / repair diary; send a booking to the workshop
- **Workshop** — job cards, labour/parts lines, fleet authorisation, raise invoice
- **Garages & drivers** — network directory and people
- **Invoices & payments** — VAT invoice, demo card capture, Stripe Checkout when keys exist

## Stripe (optional)

Set `STRIPE_SECRET_KEY` in the server environment. Without keys, **Pay with demo card** still settles invoices.

## Project layout

```
DriveControl/
  client/     React app
  server/     Express API
  docker-compose.yml
  render.yaml
```
