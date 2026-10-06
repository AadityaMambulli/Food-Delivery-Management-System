# Application Architecture

## Request flow

The React single-page UI in `frontend/src/App.jsx` calls same-origin `/api`
routes. Vite proxies those requests to the Express server at
`http://localhost:5000` during development. The backend in `backend/src/app.js`
keeps the health check, mounts `src/routes/api.js`, and returns explicit JSON
errors. Route handlers use controllers; Mongoose schemas/models are centralized
in `src/models/index.js`.

## Backend areas

- `src/config/database.js`: local MongoDB/Mongoose connection.
- `src/models/index.js`: all 18 named collection schemas and indexes.
- `src/routes/api.js`: CRUD, query, search, index, dashboard, and report routes.
- `src/controllers/resources.js`: safe named filters and generic collection
  CRUD/list handlers; full mutation support is gated to the four core resources.
- `src/controllers/queries.js`: projections, limits, text search, filter
  builders, comparison/logical/array/embedded demonstrations, and indexes.
- `src/controllers/reports.js`: actual MongoDB aggregation pipelines.
- `src/seed.js`: deterministic-shape Mumbai demo records and reset/reseed flow.

## Frontend areas

The responsive left-navigation app has Dashboard, Customers, Restaurants, Menu
Items, Orders, Search & Filters, and Reports. CRUD forms are intentionally
simple and the Search & Filters page calls real API examples rather than
accepting arbitrary raw MongoDB input.

## Database design choices

ObjectId references join independently maintained customers, restaurants,
categories, menu items, orders, payments, delivery partners, and support data.
Orders additionally embed purchase-time menu name/quantity/price snapshots and
the delivery address; menu items embed nutrition; restaurants embed their
address; arrays model ingredients, tags, carts, favorites, order items, and
support messages.

Three order aggregations produce restaurant revenue, customer spending, and
order-status summaries. A fourth report unwinds embedded items for best sellers.
The local deployment requires MongoDB only; no external services or
authentication/payment infrastructure are part of the project.
