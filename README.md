# Task Service
A generic project and task service for HudHud apps. Backend only, REST API under `/v1`.

## Run locally
Requires Node.js 24, pnpm and Docker.

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm exec sequelize-cli db:migrate
pnpm exec sequelize-cli db:seed:all
```

The seeder adds a client named `Portal` with the dev API key `portal-dev-key`.

## API docs
Open http://localhost:3000/docs, press **Authorize**, and set:
- `x-api-key`: `portal-dev-key`
- `x-user-id`: any user id, for example `sara`

## Tests
Docker must be running. The tests start their own temporary PostgreSQL.

```bash
pnpm test
```