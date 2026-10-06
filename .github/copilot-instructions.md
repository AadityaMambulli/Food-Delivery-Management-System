# Copilot Instructions

Read [AGENTS.md](../AGENTS.md), [CURRENT_STATE.md](../CURRENT_STATE.md), and
[DECISIONS.md](../DECISIONS.md) before making project changes. Keep those
context files and [CLAUDE.md](../CLAUDE.md) accurate as implementation
progresses.

## Project constraints

- This is a deadline-driven college food delivery management project. Favor
  clear, demonstrable, reliable code over extra abstractions.
- Use React, Vite, and JavaScript in `frontend/`; use Node.js, Express, and
  Mongoose in `backend/`.
- Use only the local MongoDB server at
  `mongodb://localhost:27017/food_delivery_db`. Do not add cloud databases,
  Docker, authentication providers, payment gateways, or unrelated services.
- The 18 implemented collections and MongoDB demonstrations are documented in
  `CURRENT_STATE.md` and `database/README.md`; preserve their collection names,
  relationships, seed data, and working API coverage.
- Never commit `.env` files or secrets. Keep `.env.example` free of secrets.
- Do not replace working files without checking the current implementation and
  the user's latest instruction. Extend the health endpoint, models, API,
  seed script, and frontend already in place; see `CURRENT_STATE.md`.

## Current implementation

The full college-demo scope is implemented: core CRUD, 18 Mongoose models,
query examples, search, reports, seed data, and the frontend pages described in
`CURRENT_STATE.md`. Keep changes simple and preserve working features.

## Run locally

1. Start the installed MongoDB Community Server.
2. In `backend/`, run `npm install`, copy `.env.example` to `.env`, run
   `npm run seed`, then run `npm run dev`.
3. In `frontend/`, run `npm install` and `npm run dev`.
4. The backend health check is `http://localhost:5000/api/health`.
