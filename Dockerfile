FROM node:22-slim AS base

# --------> The development image
FROM base AS dev
WORKDIR /app
COPY . .
RUN yarn install
CMD ["yarn", "dev"]

# --------> The build image
FROM base AS build
WORKDIR /app
COPY . . 
RUN yarn install
RUN yarn build

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN yarn install --production

# --------> The production image
FROM gcr.io/distroless/nodejs22-debian12 AS prod
WORKDIR /app
COPY --from=build /app/dist/ ./
COPY --from=deps /app/node_modules ./node_modules
CMD ["server.js"]
