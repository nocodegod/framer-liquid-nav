# Stage 1: Build the JS bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ src/
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist/ /srv/
EXPOSE 80
