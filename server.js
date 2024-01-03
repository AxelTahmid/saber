import 'dotenv/config'

import fastify from 'fastify'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifyFormbody from '@fastify/formbody'
import fastifySensible from '@fastify/sensible'
import fastifyUnderPressure from '@fastify/under-pressure'
import fastifyRateLimit from '@fastify/rate-limit'
import closeWithGrace from 'close-with-grace'

import routes from './app/routes.js'
import conf from './config/environment.js'
import redis from './plugins/redis.js'
import jwt from './plugins/jwt.js'
import bullMQ from './plugins/bullMQ.js'
import knex from './plugins/knex.js'
import knexfile from './database/knexfile.js'

//  give array of ip for trustproxy in production
const app = fastify({
    trustProxy: true,
    requestTimeout: 120000,
    logger: {
        transport: conf.isDevEnvironment
            ? {
                  target: 'pino-pretty',
                  options: {
                      translateTime: 'HH:MM:ss Z',
                      ignore: 'pid,hostname'
                  }
              }
            : undefined
    }
})

if (conf.isDevEnvironment) {
    conf.cors.origin.push(/localhost(:\d{1,5})?/)
}

app.register(fastifyHelmet, { global: true })
app.register(fastifyCors, conf.cors)
app.register(fastifyFormbody)
app.register(fastifySensible)
app.register(fastifyUnderPressure, conf.healthcheck)
app.register(fastifyRateLimit, conf.rate_limit)
app.register(redis, conf.redis)
app.register(jwt)
app.register(bullMQ, conf.bullMQ)

/**
 * * Database
 */
if (conf.isDevEnvironment) {
    app.log.info('using development database')
    app.register(knex, knexfile.development)
} else {
    app.log.info('db: production')
    app.register(knex, conf.sql)
}

/**
 * * Register the app directory
 */
app.register(routes)

/**
 * * delay is the number of milliseconds for the graceful close to finish
 */
const closeListeners = closeWithGrace(
    { delay: 2000 },
    async function ({ err }) {
        app.log.info('graceful shutdown -> entered')
        if (err) {
            app.log.error(err)
        }
        await app.close()
    }
)

app.addHook('onClose', async (instance, done) => {
    closeListeners.uninstall()
    app.log.info('graceful shutdown -> sucessful')
    done()
})

try {
    app.listen({
        host: conf.host,
        port: conf.port
    })
} catch (err) {
    app.log.error(err)
    throw Error(err)
}
