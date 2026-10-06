# Current State

## Project purpose and environment

Food Delivery Management System is a local, demonstrable college project for
managing customers, restaurants, food menus, and orders while showing real
MongoDB operations.

- Frontend: React, Vite, JavaScript, responsive CSS.
- Backend: Node.js, Express, Mongoose, dotenv, cors.
- Database: MongoDB Community Server on this Windows computer.
- Database name: `food_delivery_db`.
- URI: `mongodb://localhost:27017/food_delivery_db`.
- `mongosh` is unavailable and is not required; use Mongoose and MongoDB
  Compass.
- Detected versions: Node.js 24.15.0, npm 10.9.9, Git 2.54.0.

## Implemented

- [x] Local MongoDB connection and `/api/health`.
- [x] 18 Mongoose models with explicit collection names, references, embedded
  documents, arrays, validation, and useful indexes.
- [x] Safe-to-rerun demo seed script that clears/recreates the 18 collections.
- [x] Complete CRUD APIs for customers, restaurants, menu items, and orders.
- [x] GET/POST APIs for each of the remaining collections.
- [x] Restaurant/menu text search, query filters, comparisons/logical examples,
  projections, server-side limits, embedded/array examples, index endpoint.
- [x] Restaurant revenue, customer spending, order-status, and top-menu-item
  MongoDB aggregation endpoints.
- [x] React dashboard, Customers, Restaurants, Menu Items, Orders,
  Search & Filters, Reports, and MongoDB Operations demonstrations.
- [x] Persistent project/handoff documentation updated.

## Collections and seed counts

The seeded local database currently contains all 18 collections:

| Collection | Seed count |
|---|---:|
| customers | 10 |
| addresses | 10 |
| restaurants | 8 |
| restaurant_categories | 5 |
| menu_items | 30 |
| menu_categories | 7 |
| orders | 25 |
| order_items | 50 |
| payments | 25 |
| delivery_partners | 10 |
| deliveries | 25 |
| reviews | 20 |
| coupons | 8 |
| cart | 8 |
| favorites | 10 |
| offers | 10 |
| notifications | 20 |
| support_tickets | 10 |

Seed totals printed by `npm run seed`; it uses realistic Mumbai/Indian data and
valid references. Rerunning it resets these demo collections.

## Main API endpoints

All paths are prefixed by `/api`.

- Health and dashboard: `GET /health`, `GET /dashboard`.
- Customer CRUD: `/customers`, `/customers/:id`.
- Restaurant CRUD: `/restaurants`, `/restaurants/:id`.
- Menu item CRUD: `/menu-items`, `/menu-items/:id`.
- Order CRUD: `/orders`, `/orders/:id`.
- Other resources: `GET, POST /addresses`, `/restaurant-categories`,
  `/menu-categories`, `/order-items`, `/payments`, `/delivery-partners`,
  `/deliveries`, `/reviews`, `/coupons`, `/cart`, `/favorites`, `/offers`,
  `/notifications`, `/support-tickets`.
- Projected restaurant list: `GET /restaurants/summary`.
- Top results: `GET /menu-items/top?limit=10`.
- Validated filters: `GET /menu-items/filter?...`.
- Text search: `GET /search/restaurants?q=biryani`,
  `GET /search/menu-items?q=paneer`.
- Database examples: `GET /queries/comparison`, `/queries/logical`,
  `/queries/arrays`, `/queries/embedded`, `/indexes`.
- Reports: `GET /reports/restaurant-revenue`,
  `/reports/customer-spending`, `/reports/order-status`,
  `/reports/top-menu-items`.

Error behavior: invalid IDs/validation failures return 400, missing records
return 404, and duplicate unique values return 409.

## Final rubric check

- [x] 18 purposeful MongoDB collections; seed counts recorded above.
- [x] CRUD APIs for customers, restaurants, menu items, and orders.
- [x] Logical and comparison operators: `$and`, `$or`, `$not`, `$gt`, `$gte`,
  `$lt`, `$lte`, `$ne`, `$in`, `$nin`.
- [x] Projection and server-side result limits.
- [x] Arrays and embedded/nested documents are stored and queried.
- [x] Three real aggregation pipelines use `$match` as applicable, `$group`,
  `$sort`, and `$project`.
- [x] Useful indexes and MongoDB restaurant text search.
- [x] React Search & Filters and Reports pages.
- [x] Local MongoDB connection and health endpoint.
- [x] Seed data and setup/query documentation.

## MongoDB requirements demonstrated

- CRUD: full customer, restaurant, menu item, and order APIs and UI.
- Comparison: `$gt`, `$gte`, `$lt`, `$lte`, `$ne`, `$in`, `$nin`.
- Logical: `$and`, `$or`, `$not`.
- Projection and Mongoose `.limit()` with top-result control.
- Arrays: ingredients, tags, `favorites.restaurantIds`, cart items, and embedded
  order items.
- Embedded documents: restaurant address, menu nutrition, order delivery
  address, order purchase snapshots.
- Aggregations execute on MongoDB orders: delivered restaurant revenue,
  delivered customer spend, order status counts/value. They use `$match`,
  `$group`, `$sort`, `$project` (and `$lookup` for names).
- Indexes: unique `customers.email`, `orders.{ customerId: 1, createdAt: -1 }`,
  `menu_items.restaurantId`, and a restaurant text index for name/cuisine/
  description. Inspect via `GET /api/indexes`.
- Text search: MongoDB `$text` query for restaurants; menu name/description/
  tags search.

## Frontend pages

- Dashboard with live totals and best-selling dish/restaurant previews.
- Customers with create/read/update/delete.
- Restaurants with search, cuisine, rating, open filters and CRUD.
- Menu Items with name, price, rating, availability, result limit, and CRUD.
- Orders with status, payment, amount, and date filters and CRUD/status updates.
- Search & Filters with text search, price/rating/availability/nutrition/order
  status filters, limit, and safe logical/comparison/array/embedded/index
  demonstrations.
- Reports with three aggregation result tables.

## Commands

Start local MongoDB first. From `backend/`:

```powershell
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

From `frontend/` in a second terminal:

```powershell
npm install
npm run dev
```

Frontend production build: `cd frontend; npm run build`.

## Verification completed

- Backend JavaScript syntax checks passed.
- `npm run seed` succeeded and printed counts for all 18 collections.
- HTTP exercised health, complete CRUD for the four required resources,
  projected summaries, top limit, menu filters, restaurant and menu search,
  all operator/example endpoints, index endpoint, and each report pipeline.
- Frontend `npm run build` succeeded after the implementation.
- Backend and frontend `npm audit` each report zero vulnerabilities.
- Invalid ID returned 400, invalid required-field input returned 400, and
  duplicate customer email returned 409.
- MongoDB Compass-style index API confirmed the actual restaurant text index.
- Browser smoke test rendered live dashboard metrics and aggregation reports;
  restaurant text search returned the seeded restaurant through the Vite proxy.

## Known limitations

- No authentication/authorization, payment gateway, real delivery tracking,
  external notifications, or cloud deployment, by design.
- Generic GET/POST is supported for the other 14 collections; edit/delete UI
  is focused on customers, restaurants, menu items, and orders.
- This local class demo is not intended for public deployment.

## 5–10 minute demo

1. Start MongoDB, seed, start backend, and start Vite.
2. Show Dashboard cards and explain they are live MongoDB counts/aggregation.
3. Create/update/delete a temporary customer.
4. Filter and text-search restaurants; show projected summary fields.
5. Filter menu items by price, rating, and availability; change top result
   limit and show the embedded nutrition/array query examples.
6. Filter orders by status/date and update an order status.
7. Show comparison/logical query examples and actual index metadata.
8. Open Reports and explain the three aggregation pipelines.
9. In MongoDB Compass, inspect the `food_delivery_db` collections and indexes.

## Preserve / handoff

Extend rather than unnecessarily replace the explicit collection models,
validated API query/controller structure, seed script, and Vite/React entry
point. Read `AGENTS.md`, `CLAUDE.md`, and `DECISIONS.md` before future changes.
