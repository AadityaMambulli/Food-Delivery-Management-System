# MongoDB Query Demonstrations

All examples below execute through Mongoose against the local
`food_delivery_db`; they are not pseudocode-only requirements. `mongosh` is not
needed. Use MongoDB Compass or the HTTP requests shown below to demonstrate
results.

## CRUD

Use customer CRUD to demonstrate the full lifecycle:

```http
POST   http://localhost:5000/api/customers
GET    http://localhost:5000/api/customers?limit=10
GET    http://localhost:5000/api/customers/<document-id>
PUT    http://localhost:5000/api/customers/<document-id>
DELETE http://localhost:5000/api/customers/<document-id>
```

The same complete CRUD routes are implemented for `restaurants`, `menu-items`,
and `orders`. The other collections have GET and POST endpoints.

## Comparison operators

`GET /api/queries/comparison` executes each filter and returns named result
groups. The expressions are in `backend/src/controllers/queries.js`.

```js
MenuItem.find({ price: { $gt: 300 } });                            // $gt
MenuItem.find({ rating: { $gte: 4.5 } });                          // $gte
MenuItem.find({ price: { $lt: 200 } });                            // $lt
Restaurant.find({ minimumOrder: { $lte: 200 } });                  // $lte
Customer.find({ isActive: { $ne: false } });                       // $ne
Customer.find({ membershipLevel: { $in: ['Gold', 'Platinum'] } }); // $in
Customer.find({ membershipLevel: { $nin: ['Regular'] } });         // $nin
```

Named HTTP filter inputs are parsed and validated before becoming MongoDB
conditions; the application does not accept arbitrary query JSON.

## Logical operators

`GET /api/queries/logical` runs these examples:

```js
Customer.find({
  $and: [{ isActive: true }, { membershipLevel: { $in: ['Gold', 'Platinum'] } }]
});
Order.find({
  $or: [{ orderStatus: 'Delivered' }, { orderStatus: 'Out for Delivery' }]
});
MenuItem.find({ isAvailable: { $not: { $eq: false } } });
```

## Projection and limit

```http
GET /api/restaurants/summary
GET /api/menu-items/top?limit=5
```

The summary projects only `name`, `cuisine`, `rating`, and `deliveryTime`.
The top endpoint sorts by rating and uses the Mongoose `.limit()` method with a
validated/clamped user limit.

## Arrays and embedded fields

`GET /api/queries/arrays` runs:

```js
MenuItem.find({ ingredients: { $in: ['Paneer'] } });
MenuItem.find({ ingredients: { $all: ['Tomato', 'Onion'] } });
Favorite.find({ restaurantIds: { $exists: true, $ne: [] } });
Cart.find({ 'items.0': { $exists: true } });
```

`GET /api/queries/embedded` runs:

```js
Restaurant.find({ 'address.city': 'Mumbai' });
MenuItem.find({ 'nutrition.calories': { $lt: 600 } });
```

`orders.items` stores purchase-time item snapshots; `orders.deliveryAddress`,
`restaurants.address`, and `menu_items.nutrition` are also embedded documents.

## Indexes and text search

- Customer email has a unique index.
- Order history has `{ customerId: 1, createdAt: -1 }`.
- Menu items have a `restaurantId` index.
- Restaurant text search indexes `name`, `cuisine`, and `description`.

Use `GET /api/indexes` to inspect current MongoDB indexes.

```js
Restaurant.find({ $text: { $search: 'biryani' } })
  .select({ score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } });
```

Try `GET /api/search/restaurants?q=biryani` or menu search at
`GET /api/search/menu-items?q=paneer`.

## Search/filter inputs

Example:

```http
GET /api/menu-items/filter?minPrice=200&maxPrice=500&minRating=4&available=true&caloriesBelow=600&limit=10
```

Other supported menu parameters include `search`, `restaurantId`, `categoryId`,
and `ingredient`. Restaurant lists support cuisine, rating, and open state;
orders support status, payment status, amount bounds, and date range.

## Aggregations

The Reports page calls real MongoDB `Order.aggregate()` endpoints:

1. `GET /api/reports/restaurant-revenue`: `$match` Delivered orders, `$group`
   by restaurant, `$sort` by revenue, `$lookup` restaurant name, `$project`
   readable columns.
2. `GET /api/reports/customer-spending`: same pattern grouped by customer and
   joined to customer names.
3. `GET /api/reports/order-status`: `$group` by order status, calculate count
   and total order value, `$sort`, then `$project`.

`GET /api/reports/top-menu-items` additionally `$unwind`s embedded `items` and
groups quantity sold per menu item.
