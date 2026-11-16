FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:/app/data/solo.db"
RUN npx prisma generate && npx next build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=Asia/Baku
RUN apk add --no-cache tzdata
ENV DATABASE_URL="file:/app/data/solo.db"
COPY --from=build /app ./
RUN mkdir -p /app/data /app/uploads
VOLUME ["/app/data", "/app/uploads"]
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx next start -p 3000"]
