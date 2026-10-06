# Claude Code Project Context

Start by reading [AGENTS.md](AGENTS.md), [CURRENT_STATE.md](CURRENT_STATE.md),
[DECISIONS.md](DECISIONS.md), and [docs/architecture.md](docs/architecture.md).
This is the persistent handoff context for the Food Delivery Management System.

## Purpose and constraints

Build a demonstrable college food delivery management application. Prefer
working, easy-to-explain functionality over complexity; the project deadline
is near. Use React + Vite + JavaScript, Express + Mongoose, and the installed
local MongoDB Community Server only.

- Database: `food_delivery_db`
- Connection: `mongodb://localhost:27017/food_delivery_db`
- No `mongosh` dependency; access MongoDB using Node.js/Mongoose.
- No Docker, Atlas, PostgreSQL, Redis, Firebase, external auth, or payment
  gateway.
- Never overwrite existing working code or commit `.env` secrets.
- Preserve the implemented API, 18 model definitions, seed process, and
  frontend features; see `CURRENT_STATE.md` for their status and test evidence.

## Current state

The 18 Mongoose collections, seed script, required CRUD/query/report APIs, and
React Dashboard, Customers, Restaurants, Menu Items, Orders, Search & Filters,
and Reports pages are implemented. Read `CURRENT_STATE.md` for exact seed
counts, routes, test results, run commands, and known limitations. If asked to
continue, fix or extend the current implementation rather than scaffolding over
the working foundation.

## Commands

Run MongoDB locally. In `backend/`, install packages, copy `.env.example` to
`.env`, run `npm run seed`, and start with `npm run dev`. In `frontend/`,
install packages and run `npm run dev`. Backend health URL:
`http://localhost:5000/api/health`.
