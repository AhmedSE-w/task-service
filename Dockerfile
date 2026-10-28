FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm@12.14.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "pnpm exec sequelize-cli db:migrate && pnpm exec sequelize-cli db:seed:all && node src/server.js"]