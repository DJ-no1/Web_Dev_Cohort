# Project Architecture & Structure

Repository: WebDev Cohort — April — `auth`

This document describes the project's folder layout, responsibilities of each file/module, the high-level architecture, authentication flows, environment/configuration, and recommended next steps. Use this as a living reference for onboarding, maintenance, and feature planning.

---

## At a glance

- Purpose: A small authentication service (backend) with a minimal frontend for demo/testing.
- Primary concerns: user registration, login, password reset (forgot/reset), JWT-based authentication, email integration.
- Main languages & runtimes: Node.js (server-side JavaScript). Likely uses Express-style routing and middleware patterns.

---

## Repo snapshot (top-level)

```
docker-compose.yml
package.json
server.js
frontend/
  index.html
  src/
    app.js
src/
  common/
    config/
      db.js
      email.js
    dto/
      base.dto.js
    middleware/
      validate.middleware.js
    utils/
      api-error.js
      api-response.js
      jwt.utils.js
modules/
  auth/
    auth.controller.js
    auth.middleware.js
    auth.model.js
    auth.routes.js
    auth.service.js
    dto/
      forgot-password.dto.js
      login-dto.js
      register.dto.js
      reset-password.dto.js
```

The tree above reflects the current workspace layout. The sections below explain each file or folder and its role.

---

## Root files

- `docker-compose.yml`: Defines multi-container setups for local development (DB, app, maybe mailcatcher). Use this to start dependent services while developing.
- `package.json`: NPM scripts and dependency definitions. Run `npm install` to install packages; check `scripts` for `start`, `dev`, or `test` commands.
- `server.js`: Application entrypoint. Typical responsibilities:
  - Load environment variables (e.g., via `dotenv`).
  - Initialize DB connection (`src/common/config/db.js`).
  - Configure Express app (JSON parsing, CORS, logging).
  - Mount route groups (e.g., `modules/auth/auth.routes.js`).
  - Attach generic error handler.
  - Start the HTTP server at `process.env.PORT` or default port (commonly `3000`).

---

## Frontend (static/demo)

- `frontend/index.html`: Minimal static page used for manual testing or demo.
- `frontend/src/app.js`: Small client-side script that can call the backend endpoints (register/login). Useful for manual end-to-end testing.

Note: This project primarily focuses on backend auth logic; the frontend is a tiny playground rather than a full SPA.

---

## `src/common` (shared utilities & config)

Purpose: shared low-level utilities used across modules.

- `config/db.js`
  - Centralized DB connection code. Exports a function or connection object used by models.
  - Reads DB config from environment variables (e.g., `DB_URI`, `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`).
  - If using an ORM (Sequelize, TypeORM, Mongoose), this file initializes and exports the client instance.

- `config/email.js`
  - Email transporter configuration (likely using `nodemailer`).
  - Exports a `sendMail()` helper or a configured transporter that other services can use to send reset/confirmation emails.

- `dto/base.dto.js`
  - Base Data Transfer Object definitions / validation helper.
  - Common patterns: define shape, optional/required fields, and validation rules used by `validate.middleware.js`.

- `middleware/validate.middleware.js`
  - Middleware to validate request bodies against DTOs.
  - On validation error, returns structured error (likely using `api-response` or `api-error`).

- `utils/api-error.js`
  - Custom error class that includes HTTP status codes and messages. Controllers and services should throw this to be handled centrally.

- `utils/api-response.js`
  - Utility to standardize successful API responses: `{ success: true, data, message }` or similar.

- `utils/jwt.utils.js`
  - JWT helpers: `sign(payload)`, `verify(token)`, and helpers to build tokens with expiry.
  - Uses `JWT_SECRET` and maybe `JWT_EXPIRES_IN` from environment.

---

## `modules/auth` (authentication domain)

This module encapsulates all authentication-related logic and routes.

- `auth.routes.js`
  - Declares endpoints, e.g. `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
  - Binds DTO validators and middleware to routes.

- `auth.controller.js`
  - HTTP layer: receives requests, calls service functions, catches expected errors, and returns formatted responses.

- `auth.service.js`
  - Business logic: user creation, credential checks, token creation, reset token generation and verification, and delegating persistent operations to `auth.model.js`.
  - Responsibilities include password hashing (e.g. `bcrypt`), token lifecycle, and email triggers.

- `auth.model.js`
  - Data access layer — raw DB interactions or ORM model definitions.
  - Common methods: `findByEmail`, `createUser`, `updateResetToken`, `verifyResetToken`, etc.

- `auth.middleware.js`
  - Route guard middleware for protected endpoints. Verifies JWT tokens via `jwt.utils.js` and attaches `req.user`.

- `dto/*` (per-endpoint DTOs)
  - `register.dto.js` — fields: `email`, `password`, `name` (and validation rules).
  - `login-dto.js` — fields: `email`, `password`.
  - `forgot-password.dto.js` — fields: `email`.
  - `reset-password.dto.js` — fields: `token`, `newPassword`.

---

## High-level architecture (layered)

1. HTTP Layer (Express)
   - Entry: `server.js` sets up middleware (parsing, CORS), mounts routers.
2. Router Layer
   - `modules/*/*.routes.js` maps endpoints to controllers and middleware.
3. Controller Layer
   - `*.controller.js` — translate HTTP requests to service calls and format responses.
4. Service Layer
   - `*.service.js` — application logic, validation beyond DTO, orchestration (email, hashing, tokens).
5. Model / Persistence Layer
   - `*.model.js` — DB queries, ORM models.
6. Shared Utilities
   - `src/common/*` for cross-cutting concerns (JWT, email, DTO validation, API responses/errors).

This pattern supports separation of concerns and makes unit testing easier (mock services/models).

---

## Authentication flows (step-by-step)

### Registration (POST /api/auth/register)

1. Client submits `POST /api/auth/register` with body validated by `register.dto`.
2. `validate.middleware` ensures required fields and formats.
3. Controller calls `auth.service.register(payload)`.
4. Service checks for existing user via `auth.model.findByEmail()`.
5. Service hashes password (recommended: `bcrypt`) and writes the new user record via `auth.model.createUser()`.
6. Optionally, service triggers a confirmation email using `src/common/config/email.js`.
7. Controller returns success response (e.g., `201 Created`) with user summary (without password).

### Login (POST /api/auth/login)

1. Client posts credentials to `POST /api/auth/login` validated by `login-dto`.
2. Controller -> Service: `auth.service.authenticate(email, password)`.
3. Service loads user via `auth.model.findByEmail()` and compares hashed password.
4. On success, service creates a JWT using `jwt.utils.sign({ userId, roles? })`.
5. Token returned in response body (and/or as `Authorization` header).

### Forgot / Reset Password

- Forgot:
  1. `POST /api/auth/forgot-password` with `email`.
  2. Service generates a password-reset token (secure random string or JWT with short expiry).
  3. Service stores token (or hashed token and expiry) via `auth.model.updateResetToken()`.
  4. Service sends email with reset link to user using `email.js`.
- Reset:
  1. Client visits link and submits `POST /api/auth/reset-password` with `token` and `newPassword`.
  2. Service verifies token via DB lookup or `jwt.utils.verify()`.
  3. If valid, service updates the user's password (hash + save) and invalidates the reset token.

---

## Environment variables (typical)

Keep these in `.env` (not committed):

- `PORT` — port to run the server (e.g., `3000`).
- `NODE_ENV` — `development` / `production`.
- `DB_URI` or `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` — DB connection config.
- `JWT_SECRET` — secret used to sign JWTs (strong random string).
- `JWT_EXPIRES_IN` — token lifespan (e.g., `1h`, `7d`).
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — email transporter credentials for `email.js`.
- Any cloud or external service keys used by the project.

Check `src/common/config/*` for exact variable names used by this codebase.

---

## How to run (local development)

1. Install dependencies:

```bash
npm install
```

2. Start dependent services (if using Docker):

```bash
docker-compose up -d
```

3. Start the server (example):

```bash
# development (if package.json has a dev script)
npm run dev

# or
node server.js
```

4. Visit the demo frontend (if any) at `frontend/index.html` served statically or open it directly in the browser and point API requests to `http://localhost:$PORT`.

---

## Example API requests (curl)

Register:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secret123","name":"Test User"}'
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secret123"}'
```

Forgot-password (initiates email):

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Reset-password:

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<RESET_TOKEN>","newPassword":"NewSecret123"}'
```

---

## Testing & debugging tips

- Use Postman or Insomnia for exercising endpoints.
- Add `console.log` or `debug` logs in `server.js` and service functions while developing.
- Write unit tests for `auth.service` (mock `auth.model`) and integration tests for routes.

---

## Security & best practices (recommended)

- Hash passwords with `bcrypt` (salted) and never store plaintext passwords.
- Use HTTPS in production and set secure cookies if cookies are used.
- Keep `JWT_SECRET` secret and rotate it if compromised.
- Set short expirations for access tokens and consider refresh tokens for long sessions.
- Validate and sanitize inputs to prevent injection attacks.
- Rate-limit auth endpoints (login, forgot-password) to mitigate brute-force.
- Add email verification for new accounts if required.

---

## Suggested improvements & roadmap

- Add refresh token flow (secure storage, rotation).
- Add account email verification flow.
- Implement role-based access control (RBAC) in `auth.service` and middleware.
- Add structured logging (winston/pino) and centralized error reporting.
- Create automated tests (Jest / Supertest) for controllers and services.
- Add CI workflow to run tests and linters on PRs.

---

## Where to look next in this repo

- Routing/entry: `server.js` and `modules/auth/auth.routes.js`
- Business logic: `modules/auth/auth.service.js`
- DB access: `modules/auth/auth.model.js` and `src/common/config/db.js`
- Validation and DTOs: `src/common/dto` and `modules/auth/dto`
- Email sending: `src/common/config/email.js`
- JWT helpers: `src/common/utils/jwt.utils.js`

---

If you'd like, I can:

- Update this document with code-level details after reading specific files (e.g., `package.json`, `server.js`, `auth.routes.js`).
- Create `README.md` from this doc and add example environment files and `.env.example`.
- Commit the new file to a Git branch and open a PR.

Tell me which you prefer and I'll continue.
