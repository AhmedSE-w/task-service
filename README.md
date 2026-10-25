# Task Service

A generic project and task service for HudHud apps. Backend only, REST API under `/v1`.

## Run locally

Requires Docker.

```bash
docker compose up -d
```

On start, the service runs the migrations and the seeder. The seeder adds a client named `Portal` with the dev API key `portal-dev-key`.

## API docs

Open http://localhost:3000/docs, press **Authorize**, and set:

- `x-api-key`: `portal-dev-key`
- `x-user-id`: any user id, for example `sara`

## Tests

Requires Node.js 24, pnpm and Docker. The tests start their own temporary PostgreSQL.

```bash
pnpm install
pnpm test
```
