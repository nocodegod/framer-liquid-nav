# Stage 1: Build the JS bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ src/
RUN npm run build
# Publish LiquidNav<N>.js + LiquidNavMobile<N>.js (N=2..19) as URL aliases
# (same bundle bytes per family, different URLs) so Framer's URL-keyed
# import cache can be bypassed by incrementing the alias whenever the cache
# gets sticky. Each file is ~12–14kb.
RUN for i in $(seq 2 19); do \
        cp /app/dist/LiquidNav.js /app/dist/LiquidNav${i}.js && \
        cp /app/dist/LiquidNavMobile.js /app/dist/LiquidNavMobile${i}.js; \
    done

# Stage 2: Serve with Caddy
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist/ /srv/
EXPOSE 80
