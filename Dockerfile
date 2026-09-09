# Этап 1: установка зависимостей приложения.
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# Этап 2: сборка приложения Next.js.
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build


# Этап 3: минимальный контейнер для запуска готового приложения.
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Папка для файлов, прикреплённых к заявкам.
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["npm", "run", "start"]