import fp from "fastify-plugin"

import Redis from "ioredis"
const { CacheService } = require("../utility/cache")

async function fastifyRedis(fastify, options) {
    const redis = new Redis(options)

    redis.on("connect", () => {
        fastify.log.info("Redis Connected")
    })

    redis.on("error", (err) => {
        fastify.log.error(err, "Redis connection error")
    })

    redis.on("close", () => {
        fastify.log.warn("Redis connection closed")
    })

    redis.on("reconnecting", () => {
        fastify.log.info("Redis attempting to reconnect")
    })

    if (!fastify.redis) {
        fastify.decorate("redis", redis)
    }

    if (!fastify.cache) {
        fastify.decorate("cache", new CacheService(redis))
    }

    fastify.addHook("onClose", async (instance) => {
        await instance.redis.quit()
    })

    return redis
}

export default fp(fastifyRedis, {
    name: "redis",
})
