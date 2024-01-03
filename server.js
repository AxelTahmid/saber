require('dotenv').config()

const Fastify = require('fastify')
const closeWithGrace = require('close-with-grace')

const conf = require('./config/environment')

//  give array of ip for trustproxy in production
const app = Fastify({
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
// * Plugins
app.register(require('@fastify/helmet'), { global: true })
    .register(require('@fastify/cors'), conf.cors)
    .register(require('@fastify/formbody'))
    .register(require('@fastify/sensible'))
    .register(require('@fastify/under-pressure'), conf.healthcheck)
    .register(require('./plugins/redis'), conf.redis)
    .register(require('./plugins/jwt'))
    .register(require('./plugins/bullMQ'), conf.bullMQ)
    .register(require('@fastify/rate-limit'), conf.rate_limit)

/**
 * * Database
 */
const knex = require('./plugins/knex')
if (conf.isDevEnvironment) {
    app.log.info('using development database')
    const { development } = require('./database/knexfile')
    app.register(knex, development)
} else {
    app.log.info('db: production')
    app.register(knex, conf.sql)
}

/**
 * * Register the app directory
 */
app.register(require('./app/routes'))

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
