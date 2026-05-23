FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build static site
COPY . .
RUN yarn build

FROM caddy:2-alpine AS runtime
WORKDIR /srv
COPY --from=build /app/build /srv
COPY docker/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
