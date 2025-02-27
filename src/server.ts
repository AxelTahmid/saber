import "dotenv/config"
import { readFileSync } from "node:fs"
import type { Http2SecureServer } from "node:http2"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import closeWithGrace from "close-with-grace"
import fastify, { type FastifyInstance } from "fastify"

import routes from "@app/routes.js"
import conf from "@config/environment.js"
import knexfile from "@database/knexfile.js"
import bullMQ from "@plugins/bullMQ.js"
import jwt from "@plugins/jwt.js"
import knex from "@plugins/knex.js"
import redis from "@plugins/redis.js"

// Global error handlers for additional safety
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error)
    process.exit(1)
})
process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error)
    process.exit(1)
})

// Increase the maximum number of listeners to avoid warnings
process.setMaxListeners(20)

// Resolve current file and directory paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define a development logger configuration
const devLogger = {
    target: "pino-pretty",
    options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
    },
} as const

/**
 * Create and configure the Fastify server instance.
 */
const createServer = async (): Promise<FastifyInstance<Http2SecureServer>> => {
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
            transport: conf.isDevEnvironment ? devLogger : undefined,
        },
    }).withTypeProvider<TypeBoxTypeProvider>()

    // Adjust CORS origins for development
    if (conf.isDevEnvironment && Array.isArray(conf.cors.origin)) {
        conf.cors.origin.push(/localhost(:\d{1,5})?/)
    }

    // Register security, utility, and health check plugins
    await app
        .register(import("@fastify/helmet"), { global: true })
        .register(import("@fastify/cors"), conf.cors)
        .register(import("@fastify/formbody"))
        .register(import("@fastify/sensible"))
        .register(import("@fastify/under-pressure"), conf.healthcheck)
        .register(redis, conf.redis)
        .register(jwt)
        .register(bullMQ, conf.bullMQ)

    // Database and API documentation setup based on environment
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

    // Register application routes
    await app.register(routes)

    // Setup graceful shutdown using close-with-grace
    const closeListeners = closeWithGrace({ delay: 2000 }, async ({ signal, err }) => {
        app.log.info("Graceful shutdown initiated")
        if (err) {
            app.log.error(err)
        } else {
            app.log.info(`${signal} received, shutting down server`)
        }
        await app.close()
    })

    app.addHook("onClose", async () => {
        closeListeners.uninstall()
        app.log.info("Graceful shutdown completed")
    })

    await app.ready()
    return app
}

/**
 * Start the Fastify server.
 */
const startServer = async () => {
    try {
        const app = await createServer()
        await app.listen({
            port: Number(conf.port),
            host: conf.host,
        })
        app.log.info(`Server is running at ${conf.host}:${conf.port}`)
    } catch (error) {
        console.error("Error starting server:", error)
        process.exit(1)
    }
}

await startServer()
