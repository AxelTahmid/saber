FROM node:22-slim AS base

# --------> The development image
FROM base AS dev
WORKDIR /app
# RUN npm install -g node-gyp
COPY .yarn ./.yarn
COPY [".yarnrc.yml", "package.json", "yarn.lock", "./"]
# COPY . .
RUN yarn install
CMD ["yarn", "dev"]

# --------> The build image
FROM base AS build
WORKDIR /app
# RUN npm install -g node-gyp
COPY . . 
RUN yarn install
RUN yarn build

FROM base AS deps
WORKDIR /app
COPY .yarn ./.yarn
COPY [".yarnrc.yml", "package.json", "yarn.lock", "./"]
RUN yarn install --production

# --------> The production image
FROM gcr.io/distroless/nodejs22-debian12 AS prod
WORKDIR /app
COPY --from=build /app/dist/ ./
COPY --from=deps /app/node_modules ./node_modules
# use 70-75% of you container runtime as limit for memory
CMD ["node", "--max-old-space-size=512", "server.js"]
