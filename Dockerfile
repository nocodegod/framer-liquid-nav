# Stage 1: Build the JS bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ src/
RUN npm run build
# Publish a second URL alias (LiquidNav2.js) so Framer treats it as a brand-new
# code component and bypasses its URL-keyed import cache. Same bundle bytes.
RUN cp /app/dist/LiquidNav.js /app/dist/LiquidNav2.js

# Stage 2: Serve with Caddy
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist/ /srv/
EXPOSE 80
