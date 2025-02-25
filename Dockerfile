FROM node:22-slim as baseimg

# --------> The development image
FROM baseimg AS dev
WORKDIR /app
COPY . .
RUN yarn install
EXPOSE $PORT
CMD ["yarn", "dev"]

# --------> The build image
FROM baseimg AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install --production

# --------> The production image
FROM gcr.io/distroless/nodejs22-debian12 AS prod
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
CMD ["server.js"]
