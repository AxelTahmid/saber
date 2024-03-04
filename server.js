import "dotenv/config"

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
import knexfile from "./database/knexfile.js"
import bullMQ from "./plugins/bullMQ.js"
import jwt from "./plugins/jwt.js"
import knex from "./plugins/knex.js"
import redis from "./plugins/redis.js"

//  give array of ip for trustproxy in production
const app = fastify({
    trustProxy: true,
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

if (conf.isDevEnvironment) {
    conf.cors.origin.push(/localhost(:\d{1,5})?/)
}

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
 * * Database
 */
if (conf.isDevEnvironment) {
    app.log.info("using development database")
    await app.register(knex, knexfile.development)
} else {
    app.log.info("db: production")
    await app.register(knex, conf.sql)
}

/**
 * * Register the app directory
 */
await app.register(routes)

/**
 * * delay is the number of milliseconds for the graceful close to finish
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
    app.log.info("graceful shutdown -> sucessful")
    done()
})

try {
    app.listen({
        host: conf.host,
        port: conf.port,
    })
} catch (err) {
    app.log.error(err)
    throw Error(err)
}
