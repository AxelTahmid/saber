import "dotenv/config"
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import fastify from "fastify"
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
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = dirname(__filename) // get the name of the directory

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

if (conf.isDevEnvironment) {
    // In development, add localhost regex to CORS origins
    if (Array.isArray(conf.cors.origin)) {
        conf.cors.origin.push(/localhost(:\d{1,5})?/)
    }
}

// Register plugins
await app
    .register(import("@fastify/helmet"), { global: true })
    .register(import("@fastify/cors"), conf.cors)
    .register(import("@fastify/formbody"))
    .register(import("@fastify/sensible"))
    .register(import("@fastify/under-pressure"), conf.healthcheck)
    .register(redis, conf.redis)
    .register(jwt)
    .register(bullMQ, conf.bullMQ)

if (conf.isDevEnvironment) {
    app.log.info("db: development")
    await app
        .register(knex, knexfile.development)
        .register(import("@fastify/swagger"), conf.swagger)
        .register(import("@fastify/swagger-ui"), conf.swaggerUI)
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

await app.ready()

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
