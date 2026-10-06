# Agent Guide

## Project

Food Delivery Management System is a college project for demonstrating a
small, end-to-end food delivery application and useful MongoDB operations.
The deadline is short; keep implementation understandable, reliable, and easy
to demonstrate.

## Stack and local services

- Frontend: React, Vite, JavaScript, simple responsive CSS.
- Backend: Node.js, Express, Mongoose, dotenv, cors.
- Database: local MongoDB Community Server, database `food_delivery_db`.
- MongoDB URI: `mongodb://localhost:27017/food_delivery_db`.
- Run MongoDB as an installed Windows service/process. Do not require
  `mongosh`; the server is accessed through Mongoose.

## Data and implemented scope

The application implements 18 meaningful collections. Their purposes, seed
counts, and relationships are documented in [CURRENT_STATE.md](CURRENT_STATE.md)
and [database/README.md](database/README.md). The required CRUD, filtering,
projection, limits, arrays, embedded documents, indexes, text search, and
aggregation reports are implemented and should remain working.

The implemented application pages are Dashboard, Customers, Restaurants, Menu
Items, Orders, Search & Filters, and Reports. Remaining collections are
available through read/create API endpoints.

## Current implementation status

The backend, seed data, primary CRUD/query/report APIs, and frontend pages are
implemented. Read `CURRENT_STATE.md` for API coverage, seed counts, verification,
and known limitations.

## Working agreements

- Read [CURRENT_STATE.md](CURRENT_STATE.md) and [DECISIONS.md](DECISIONS.md)
  before continuing.
- Inspect files before modifying them. Preserve working code and unrelated
  user changes.
- Extend the verified health endpoint, 18 model definitions, API query layer,
  seed script, and Vite/React entry point instead of replacing them without a
  concrete reason; see the preserve list in `CURRENT_STATE.md`.
- Keep dependencies small and local; do not add Docker, cloud infrastructure,
  authentication, payment integrations, or unnecessary libraries.
- Do not commit `.env` or other secrets.
- Update `CURRENT_STATE.md`, `DECISIONS.md`, `CLAUDE.md`, and
  `.github/copilot-instructions.md` when the implementation status or decisions
  change.

## Run commands

Backend, from `backend/`:

```powershell
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Frontend, from `frontend/`:

```powershell
npm install
npm run dev
```

Health check: `http://localhost:5000/api/health`.
