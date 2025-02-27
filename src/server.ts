import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import fastify from "fastify"
import fastifyCors from "@fastify/cors"
import fastifyFormbody from "@fastify/formbody"
import fastifyHelmet from "@fastify/helmet"
import fastifySensible from "@fastify/sensible"
import fastifyUnderPressure from "@fastify/under-pressure"
import closeWithGrace from "close-with-grace"
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"

import routes from "@app/routes.js"
import conf from "@config/environment.js"
import knexfile from "@database/knexfile.js"
import bullMQ from "@plugins/bullMQ.js"
import jwt from "@plugins/jwt.js"
import knex from "@plugins/knex.js"
import redis from "@plugins/redis.js"

// Increase the maximum number of listeners to avoid warnings
process.setMaxListeners(20)

const logconf = {
    target: "pino-pretty",
    options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
    },
} as const

// Create the Fastify instance with HTTPS support
const app = fastify({
    trustProxy: "127.0.0.1,192.168.1.1/24",
    http2: true,
    https: {
        allowHTTP1: true,
        key: readFileSync(join(__dirname, "..", "certs", "tls.key")),
        cert: readFileSync(join(__dirname, "..", "certs", "tls.crt")),
    },
    requestTimeout: 30000, // 30 seconds
    keepAliveTimeout: 60000, // 60 seconds
    bodyLimit: 1048576, // 1 MiB
    logger: {
        transport: conf.isDevEnvironment ? logconf : undefined,
    },
}).withTypeProvider<TypeBoxTypeProvider>()

// In development, add localhost regex to CORS origins
if (conf.isDevEnvironment) {
    if (Array.isArray(conf.cors.origin)) {
        conf.cors.origin.push(/localhost(:\d{1,5})?/)
    }
}

// Register plugins
await app
    .register(fastifyHelmet, { global: true })
    .register(fastifyCors, conf.cors)
    .register(fastifyFormbody)
    .register(fastifySensible)
    .register(fastifyUnderPressure, conf.healthcheck)
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
const closeListeners = closeWithGrace({ delay: 500 }, async ({ signal, err, manual }) => {
    app.log.info("graceful shutdown -> entered")
    if (err) {
        app.log.error(err)
    } else {
        app.log.info(`${signal} received, server closing`)
    }
    await app.close()
})

app.addHook("onClose", async (_instance) => {
    closeListeners.uninstall()
    app.log.info("graceful shutdown -> successful")
})

// Start the server and catch startup errors
try {
    await app.listen({
        port: Number(conf.port),
        host: conf.host,
    })
} catch (err) {
    app.log.error(err)
    process.exit(1)
}
