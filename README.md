# Food Delivery Management System

A local, MongoDB-backed food delivery management demo for a college database
project. The application showcases customer, restaurant, menu, and order
management together with practical MongoDB filtering, indexes, text search,
embedded documents, arrays, and aggregations.

## Technology and architecture

- Frontend: React, Vite, JavaScript, responsive CSS.
- Backend: Node.js, Express, Mongoose, dotenv, cors.
- Database: MongoDB Community Server running locally.
- MongoDB URI: `mongodb://localhost:27017/food_delivery_db`
- Database: `food_delivery_db`

React pages call `/api` endpoints (the Vite dev server proxies these to
`localhost:5000`). Express routes and controllers use Mongoose models defined
in `backend/src/models/index.js`. The seed script creates valid related demo
records. No `mongosh`, cloud service, authentication provider, or payment
gateway is required.

## Run the project

Start the MongoDB Server service first. Open two PowerShell terminals.

Backend terminal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Frontend terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the frontend terminal (normally
`http://localhost:5173`). The API health endpoint is
`http://localhost:5000/api/health`. The seed script clears and recreates only
the 18 application collections and is safe to rerun.

Production frontend build:

```powershell
cd frontend
npm run build
```

## Collections

The app creates these 18 purposeful collections:

| Collection | Purpose |
|---|---|
| `customers` | Customer profile, membership, and active status. |
| `addresses` | Saved customer delivery addresses with embedded coordinates. |
| `restaurants` | Restaurant profile, cuisine, rating, availability, and embedded address. |
| `restaurant_categories` | Restaurant classification. |
| `menu_items` | Restaurant dishes with price, availability, ingredients, tags, and embedded nutrition. |
| `menu_categories` | Restaurant menu sections such as starters and desserts. |
| `orders` | Customer orders with item snapshots and embedded delivery address. |
| `order_items` | Queryable order-to-menu-item quantity and price records. |
| `payments` | Local payment method/status records; no gateway is integrated. |
| `delivery_partners` | Delivery worker and vehicle details. |
| `deliveries` | Order assignment and delivery status. |
| `reviews` | Customer ratings for restaurants/menu items. |
| `coupons` | Discount codes, thresholds, and expiry. |
| `cart` | Customer cart with an array of menu-item quantities. |
| `favorites` | Customer arrays of saved restaurant and menu-item references. |
| `offers` | Restaurant discount promotions and validity. |
| `notifications` | Customer order, offer, and account messages. |
| `support_tickets` | Customer issues, status, and embedded message history. |

Schema and relationship details are in [database/README.md](database/README.md).

## Seed data

`npm run seed` loads Indian/Mumbai demo records with valid ObjectId references.
It creates 10 customers, 10 addresses, 8 restaurants, 5 restaurant categories,
30 menu items, 7 menu categories, 25 orders, 50 order items, 25 payments, 10
delivery partners, 25 deliveries, 20 reviews, 8 coupons, 8 carts, 10 favorites,
10 offers, 20 notifications, and 10 support tickets.

## Frontend pages

- **Dashboard:** live totals, delivered revenue, popular dishes, and restaurant
  snapshot.
- **Customers:** list, create, edit, and delete customer records.
- **Restaurants:** search, cuisine/rating/open filters, list, create, edit, and
  delete.
- **Menu Items:** search, price/availability filters, visible result limit, list,
  create, edit, and delete.
- **Orders:** status/payment/amount/date filters, create and edit status/payment,
  and delete.
- **Search & Filters:** restaurant text search, menu search and comparison
  filters, availability, nutrition path, order status, limit control, logical,
  comparison, array, embedded-document, and index demonstrations.
- **Reports:** restaurant revenue, customer spending, and order-status reports.

## API overview

All endpoints are under `/api`; JSON list responses include `{ data,
pagination }` unless stated otherwise.

| Endpoint | Demonstration |
|---|---|
| `GET /health` | Backend and MongoDB status. |
| `GET /dashboard` | Real collection totals and delivered revenue. |
| `GET, POST /customers`, `GET, PUT, DELETE /customers/:id` | Complete customer CRUD. |
| `GET, POST /restaurants`, `GET, PUT, DELETE /restaurants/:id` | Complete restaurant CRUD. |
| `GET, POST /menu-items`, `GET, PUT, DELETE /menu-items/:id` | Complete menu-item CRUD. |
| `GET, POST /orders`, `GET, PUT, DELETE /orders/:id` | Complete order CRUD. |
| `GET, POST /:resource` | Read/create the other planned collections. |
| `GET /restaurants/summary` | Explicit projection and server-side limit. |
| `GET /menu-items/top?limit=10` | Sorted menu results with Mongoose `.limit()`. |
| `GET /menu-items/filter?...` | Search, price/rating/availability, restaurant/category, ingredient and nested nutrition filters. |
| `GET /search/restaurants?q=...` | MongoDB `$text` search using the restaurant text index. |
| `GET /search/menu-items?q=...` | Menu name/description/tag search. |
| `GET /queries/comparison`, `/queries/logical`, `/queries/arrays`, `/queries/embedded` | Executable operator, array, and nested-document examples. |
| `GET /indexes` | Actual MongoDB indexes on key collections. |
| `GET /reports/restaurant-revenue` | Delivered revenue grouped by restaurant. |
| `GET /reports/customer-spending` | Delivered spend grouped by customer. |
| `GET /reports/order-status` | Order count/value grouped by status. |
| `GET /reports/top-menu-items` | Top selling embedded order items. |

Invalid IDs return 400, missing records return 404, duplicate unique records
return 409, and validation/database failures return explicit JSON errors.

## MongoDB features demonstrated

- CRUD uses Mongoose document creation, query, update with validators, and
  deletion.
- Comparison examples execute `$gt`, `$gte`, `$lt`, `$lte`, `$ne`, `$in`, and
  `$nin`; filter endpoints accept validated numeric/boolean values.
- Logical examples execute `$and`, `$or`, and `$not`.
- Projection: restaurant summary returns only name, cuisine, rating, and
  delivery time (plus MongoDB `_id`).
- Limits: list endpoints and top results use Mongoose `.limit()`.
- Arrays: `ingredients`, `tags`, `orders.items`, `cart.items`,
  `favorites.restaurantIds`, and `favorites.menuItemIds`.
- Embedded documents: restaurant address, menu nutrition, order delivery
  address, order item purchase-time snapshots, and support messages.
- Indexes: unique customer email, `{ customerId, createdAt }` order history,
  menu-item `restaurantId`, and restaurant text index on name/cuisine/description.
- Restaurant text search uses MongoDB `$text` / `$search`.
- Three actual order aggregation pipelines show `$match`, `$group`, `$sort`,
  and `$project`; revenue/spending pipelines also `$lookup` readable names.

Runnable query examples and operator explanations are in
[database/queries/README.md](database/queries/README.md).

## Suggested 5–10 minute demo

1. Start MongoDB, seed once, then start the backend and Vite frontend.
2. Show the Dashboard totals and explain that they load from MongoDB.
3. Add, edit, and delete a temporary customer; show validation or duplicate
   email handling if useful.
4. Filter restaurants by cuisine/rating/open state, then search a restaurant
   with the text index.
5. Filter menu items by price, rating, availability, and visible top-result
   limit; open the MongoDB Operations examples.
6. Filter orders by status/date/amount and update one order status.
7. Open Reports and explain the `$match`, `$group`, `$sort`, `$project`, and
   `$lookup` stages.
8. Show MongoDB Compass at `localhost:27017` and point out the 18 collections
   and their indexes.

## Project handoff

Read [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md),
[CURRENT_STATE.md](CURRENT_STATE.md), and [DECISIONS.md](DECISIONS.md) before
continuing. Update these context files when implementation status changes.
