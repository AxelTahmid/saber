import fp from "fastify-plugin"

import Redis from "ioredis"
import CacheUtility from "../utility/cache.js"

async function fastifyRedis(fastify, options) {
    const redis = new Redis(options)

    redis.on("connect", () => {
        fastify.log.info("Redis Connected")
    })

    redis.on("error", (err) => {
        fastify.log.error(err, "Redis connection error")
    })

    if (!fastify.redis) fastify.decorate("redis", redis)

    if (!fastify.cache) fastify.decorate("cache", new CacheUtility(redis))

    fastify.addHook("onClose", async (instance, done) => {
        instance.redis.quit(done)
    })

    return redis
}

export default fp(fastifyRedis, {
    name: "redis",
})
