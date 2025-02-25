import "dotenv/config"
import { fileURLToPath } from "node:url"
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"

import fastifyCors from "@fastify/cors"
import fastifyFormbody from "@fastify/formbody"
import fastifyHelmet from "@fastify/helmet"
import fastifyRateLimit from "@fastify/rate-limit"
import fastifySensible from "@fastify/sensible"
import fastifyUnderPressure from "@fastify/under-pressure"
import closeWithGrace from "close-with-grace"
import fastify from "fastify"

import routes from "./app/routes.js"
import conf from "./config/environment.js"
import knexfile from "./database/knexfile.mjs"
import bullMQ from "./plugins/bullMQ.js"
import jwt from "./plugins/jwt.js"
import knex from "./plugins/knex.js"
import redis from "./plugins/redis.js"

// Increase the maximum number of listeners to avoid warnings
process.setMaxListeners(20)

// Compute __dirname for ESM modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create the Fastify instance with HTTPS support
const app = fastify({
    trustProxy: true,
    http2: true,
    https: {
        allowHTTP1: true,
        key: readFileSync(join(__dirname, "certs", "tls.key")),
        cert: readFileSync(join(__dirname, "certs", "tls.crt")),
    },
    requestTimeout: 120000,
    logger: {
        transport: conf.isDevEnvironment
            ? {
                  target: "pino-pretty",
                  options: {
                      translateTime: "HH:MM:ss Z",
                      ignore: "pid,hostname",
                  },
              }
            : undefined,
    },
})

// In development, add localhost regex to CORS origins
if (conf.isDevEnvironment) {
    conf.cors.origin.push(/localhost(:\d{1,5})?/)
}

// Register plugins
await app
    .register(fastifyHelmet, { global: true })
    .register(fastifyCors, conf.cors)
    .register(fastifyFormbody)
    .register(fastifySensible)
    .register(fastifyUnderPressure, conf.healthcheck)
    .register(fastifyRateLimit, conf.rate_limit)
    .register(redis, conf.redis)
    .register(jwt)
    .register(bullMQ, conf.bullMQ)

/**
 * Database registration
 */
if (conf.isDevEnvironment) {
    app.log.info("using development database")
    await app.register(knex, knexfile.development)
} else {
    app.log.info("db: production")
    await app.register(knex, conf.sql)
}

/**
 * Register application routes
 */
await app.register(routes)

/**
 * Setup graceful shutdown
 */
const closeListeners = closeWithGrace({ delay: 2000 }, async ({ err }) => {
    app.log.info("graceful shutdown -> entered")
    if (err) {
        app.log.error(err)
    }
    await app.close()
})

app.addHook("onClose", async (instance, done) => {
    closeListeners.uninstall()
    app.log.info("graceful shutdown -> successful")
    done()
})

// Start the server and catch startup errors
try {
    await app.listen({
        host: conf.host,
        port: conf.port,
    })
} catch (err) {
    app.log.error(err)
    process.exit(1)
}
