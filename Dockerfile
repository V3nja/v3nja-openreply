FROM node:20-slim
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN echo 'export default { schema: "prisma/schema.prisma", datasource: { url: process.env.DATABASE_URL } };' > prisma.config.ts

RUN npx prisma generate

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx scripts/seed-account.ts && npm run worker"]
