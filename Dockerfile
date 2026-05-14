# Stage 1: Build the JS bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ src/
RUN npm run build
# Publish LiquidNav2.js .. LiquidNav19.js as URL aliases (same bundle bytes,
# different URLs) so Framer's URL-keyed import cache can be bypassed by
# incrementing the alias whenever the cache gets sticky. Each file is ~12kb.
RUN for i in $(seq 2 19); do cp /app/dist/LiquidNav.js /app/dist/LiquidNav${i}.js; done

# Stage 2: Serve with Caddy
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist/ /srv/
EXPOSE 80
