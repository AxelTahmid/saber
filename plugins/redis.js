const fp = require('fastify-plugin')
const Redis = require('ioredis')
const cache = require('../utility/cache')

async function fastifyRedis(fastify, options) {
    const redis = new Redis(options)

    redis.on('connect', () => {
        fastify.log.info('Redis Connected')
    })

    redis.on('error', err => {
        fastify.log.error(err, 'Redis connection error')
    })

    if (!fastify.redis) fastify.decorate('redis', redis)

    if (!fastify.cache) fastify.decorate('cache', cache(redis))

    fastify.addHook('onClose', async (instance, done) => {
        instance.redis.quit(done)
    })

    return redis
}

module.exports = fp(fastifyRedis, {
    name: 'fastify-redis'
})
