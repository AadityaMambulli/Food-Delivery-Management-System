# Project Decisions

Record durable implementation choices here so the project can be continued by
another coding agent without reintroducing unnecessary complexity.

| Decision | Rationale |
|---|---|
| Use the existing local MongoDB Community Server at `localhost:27017`. | Required project environment; it is installed and reachable. |
| Use database `food_delivery_db` through Mongoose. | Keeps all MongoDB access in the Node.js backend and does not rely on `mongosh`. |
| Use MongoDB documents instead of a relational SQL database. | MongoDB is the professor's required database and the project demonstrates document modeling, arrays, embedded records, indexes, and aggregations. |
| Keep frontend and backend as separate npm projects. | Simple to run and explain; avoids monorepo tooling. |
| Use JavaScript, React, Vite, Express, and Mongoose. | Matches the requested technology target and keeps the learning curve low. |
| Implement 18 purposeful collections with explicit collection names. | Satisfies the required MongoDB scope while keeping each entity's purpose clear. |
| Embed order-time item/price and address snapshots while retaining order-item references. | Preserves historical order detail and still provides a separately queryable order_items collection. |
| Keep core full CRUD focused on customers, restaurants, menu items, and orders; expose GET/POST for supporting collections. | Matches the requested demo scope without spending time on repetitive secondary admin screens. |
| Do not implement authentication or an external payment gateway. | Neither is required to demonstrate MongoDB and both add scope/risk under the class-project deadline; payment status is represented as local demo data. |
| Prioritize useful query examples, seeded records, and explainable reports over production infrastructure. | The intended evaluator is a college database-project professor; every database requirement should be visible and testable. |
| Use Node's built-in `node --watch` for backend development instead of nodemon. | The installed Node.js 24 supports watch mode, while the current nodemon dependency tree triggers a high-severity npm audit advisory with no compatible registry fix. This keeps the dependency set small and `npm audit` clean. |
| Do not add Docker, cloud services, auth providers, payment gateways, or large UI libraries. | These are outside the project requirements and deadline priorities. |

Update this file when a lasting architecture or data-model decision is made.
