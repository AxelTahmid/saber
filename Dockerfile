# --------> The build image
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# --------> The production image, USER node in alpine
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
CMD ["server.js"]