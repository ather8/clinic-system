# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Must be declared as ARG for Railway to inject it at build time,
# then promoted to ENV so Vite's build step (which reads process.env,
# not Docker ARGs) can actually see it and bake it into the bundle.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Serve stage ----
FROM node:22-slim
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD serve -s dist -l ${PORT:-3000}