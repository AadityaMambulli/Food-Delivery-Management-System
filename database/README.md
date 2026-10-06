# MongoDB Data Model

## Local database

- Database: `food_delivery_db`
- URI: `mongodb://localhost:27017/food_delivery_db`
- Access layer: Mongoose models in `backend/src/models/index.js`.
- `mongosh` is not needed. Inspect records/indexes in MongoDB Compass or call
  the documented HTTP endpoints.
- Safe demo reset/reseed: from `backend/`, run `npm run seed`. The script clears
  and repopulates only the 18 application collections.

## Collections and relationships

| Collection | Main fields / relationship |
|---|---|
| `customers` | Name, unique email, phone, age, membership, active flag. |
| `addresses` | `customerId` reference; saved address and nested latitude/longitude. |
| `restaurants` | `categoryId` reference; cuisine, rating, availability, embedded `address`. |
| `restaurant_categories` | Reusable category records referenced by restaurants. |
| `menu_items` | `restaurantId` and `categoryId` references, price, availability, `ingredients[]`, `tags[]`, nested `nutrition`. |
| `menu_categories` | Shared reusable menu section labels such as starters and desserts. |
| `orders` | Customer/restaurant references, `items[]` purchase snapshots, totals, status, nested `deliveryAddress`. |
| `order_items` | Independently queryable order/menu references, quantity, price snapshot, subtotal. |
| `payments` | Order reference, amount, method, transaction status/date. |
| `delivery_partners` | Delivery partner name, phone, vehicle, rating, availability. |
| `deliveries` | Unique order reference and delivery partner reference/status/times. |
| `reviews` | Customer and restaurant references, optional menu-item reference, rating/comment. |
| `coupons` | Unique code, discount rule, minimum order, expiry, active state. |
| `cart` | Unique customer reference, restaurant reference, embedded item-reference/quantity array. |
| `favorites` | Unique customer reference and `restaurantIds[]` / `menuItemIds[]`. |
| `offers` | Restaurant reference, discount, active window. |
| `notifications` | Customer reference, message/type/read state. |
| `support_tickets` | Customer and optional order references; message history array. |

References are used for independently maintained entities. Orders also embed
item name/quantity/price/subtotal and delivery-address snapshots so that later
menu/address edits do not rewrite order history.

## Seeded demo data

| Collection | Documents |
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

`backend/src/seed.js` uses Indian names, Mumbai addresses, varied prices,
ratings, membership, payment/order statuses, and valid ObjectId references. The
seed is intentionally rerunnable and resets the demo records.

## Indexes

The models define and `npm run seed` synchronizes these useful indexes:

- `customers.email`: unique lookup / duplicate prevention.
- `orders.{ customerId: 1, createdAt: -1 }`: customer order history.
- `menu_items.restaurantId`: restaurant menu retrieval.
- `restaurants` text index on `name`, `cuisine`, and `description`.
- Additional small indexes on frequently referenced/filterable fields (for
  example address/customer, order references, and menu categories).

`GET /api/indexes` returns actual index metadata for customers, orders,
menu_items, and restaurants.

## Query demonstrations

Executable endpoint handlers are in `backend/src/controllers/queries.js`,
`backend/src/controllers/reports.js`, and `backend/src/controllers/resources.js`.
These examples use Mongoose against local MongoDB, not mocked in-memory arrays.

### 1. CRUD

```http
POST   /api/customers
GET    /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

Equivalent complete CRUD is available for restaurants, menu-items, and orders.
For a model-based example, the implementation uses `Model.create`,
`Model.findById`, `Model.findByIdAndUpdate` with `runValidators`, and
`Model.findByIdAndDelete`.

### 2–8. Comparison operators

All are executed by `GET /api/queries/comparison`.

```js
MenuItem.find({ price: { $gt: 300 } });                         // 2. $gt
MenuItem.find({ rating: { $gte: 4.5 } });                       // 3. $gte
MenuItem.find({ price: { $lt: 200 } });                         // 4. $lt
Restaurant.find({ minimumOrder: { $lte: 200 } });               // 5. $lte
Customer.find({ isActive: { $ne: false } });                    // 6. $ne
Customer.find({ membershipLevel: { $in: ['Gold', 'Platinum'] } }); // 7. $in
Customer.find({ membershipLevel: { $nin: ['Regular'] } });      // 8. $nin
```

### 9–11. Logical operators

Executed by `GET /api/queries/logical`.

```js
Customer.find({
  $and: [{ isActive: true }, { membershipLevel: { $in: ['Gold', 'Platinum'] } }]
}); // 9. $and

Order.find({ $or: [{ orderStatus: 'Delivered' }, { orderStatus: 'Out for Delivery' }] });
// 10. $or

MenuItem.find({ isAvailable: { $not: { $eq: false } } }); // 11. $not
```

### 12–13. Projection and limit

```js
Restaurant.find({}, 'name cuisine rating deliveryTime')
  .sort({ rating: -1 })
  .limit(50);

MenuItem.find({}, 'name price rating isAvailable restaurantId')
  .sort({ rating: -1, price: 1 })
  .limit(validatedLimit);
```

Use `GET /api/restaurants/summary` for the projection and
`GET /api/menu-items/top?limit=10` for a caller-visible limit. Limits are
clamped to a safe maximum; raw Mongo query objects are never accepted from the
browser.

### 14. Array query

Executed by `GET /api/queries/arrays`.

```js
MenuItem.find({ ingredients: { $in: ['Paneer'] } });
MenuItem.find({ ingredients: { $all: ['Tomato', 'Onion'] } });
Favorite.find({ restaurantIds: { $exists: true, $ne: [] } });
Cart.find({ 'items.0': { $exists: true } });
```

### 15. Embedded-document query

Executed by `GET /api/queries/embedded`.

```js
Restaurant.find({ 'address.city': 'Mumbai' });
MenuItem.find({ 'nutrition.calories': { $lt: 600 } });
```

### 16. Index

Declared in the Mongoose models and created/synchronized by seeding:

```js
schema.index({ email: 1 }, { unique: true }); // customers
schema.index({ customerId: 1, createdAt: -1 }); // orders
```

Restaurants have a MongoDB text index on `name`, `cuisine`, and `description`.
The model schema is the source of truth; `GET /api/indexes` reports the
database's actual index state.

### 17. Text search

```js
Restaurant.find({ $text: { $search: 'biryani' } })
  .select({ score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } });
```

Call `GET /api/search/restaurants?q=biryani`. Menu text search also checks
item name, description, and tags at `GET /api/search/menu-items?q=paneer`.

### Search/filter endpoint

Example:

```http
GET /api/menu-items/filter?minPrice=200&maxPrice=500&minRating=4&available=true&caloriesBelow=600&limit=10
```

The server validates each value, builds a MongoDB filter with `$and`, a nested
`$or` for text-field matching, `$gte`, `$lte`, and `$lt`, projects relevant
fields, sorts results, and applies `.limit()`. Restaurant, menu, and order list
endpoints provide cuisine/rating/open, price/availability, payment/status/date
filters respectively.

### 18–20. Aggregation pipelines

All three run against the actual orders collection and are linked to the
Reports page.

```js
// 18. Restaurant revenue: delivered orders, grouped by restaurant.
[
  { $match: { orderStatus: 'Delivered' } },
  { $group: { _id: '$restaurantId', totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
  { $sort: { totalRevenue: -1 } },
  { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
  { $unwind: '$restaurant' },
  { $project: { _id: 0, restaurant: '$restaurant.name', totalOrders: 1, totalRevenue: 1 } }
]

// 19. Customer spending: delivered orders, grouped by customer.
[
  { $match: { orderStatus: 'Delivered' } },
  { $group: { _id: '$customerId', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
  { $sort: { totalSpent: -1 } },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { _id: 0, customer: '$customer.name', totalOrders: 1, totalSpent: 1 } }
]

// 20. Order status: count and total order value by status.
[
  { $group: { _id: '$orderStatus', orderCount: { $sum: 1 }, totalValue: { $sum: '$totalAmount' } } },
  { $sort: { orderCount: -1, _id: 1 } },
  { $project: { _id: 0, status: '$_id', orderCount: 1, totalValue: 1 } }
]
```

Endpoints: `/api/reports/restaurant-revenue`,
`/api/reports/customer-spending`, and `/api/reports/order-status`. A fourth
useful report, `/api/reports/top-menu-items`, unwinds embedded order item arrays
to calculate quantity sold.

## Query safety

Filter endpoints accept only named parameters and convert numeric, boolean,
date, and ObjectId values explicitly. They never pass a browser-supplied MongoDB
query object to Mongoose. This project is for a trusted local class demo and
does not implement authentication or authorization.
