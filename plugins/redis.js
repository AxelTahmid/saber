import fp from "fastify-plugin"

import Redis from "ioredis"

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

class CacheService {
    constructor(redis) {
        this.redis = redis
    }

    async get(key, parse = true) {
        const data = await this.redis.get(key)

        if (data) {
            return parse ? JSON.parse(data) : data
        }

        return false
    }

    async set(key, data, stringify = true, exp = 300) {
        if (stringify) {
            await this.redis.set(key, JSON.stringify(data), "EX", exp)
        } else {
            await this.redis.set(key, data, "EX", exp)
        }
    }

    async flush(keys) {
        await this.redis.del(keys)
    }

    async flush_pattern(pattern) {
        const stream = this.redis.scanStream({
            match: pattern,
        })

        return new Promise((resolve, reject) => {
            stream
                .on("data", (keys = []) => {
                    if (keys.length) {
                        const pipeline = this.redis.pipeline()
                        keys.forEach((key) => pipeline.del(key))
                        pipeline.exec()
                    }
                })
                .on("error", (err) => reject(err))
                .on("end", () => resolve(`Cache cleared on: ${pattern}`))
        })
    }

    // * https://stackoverflow.com/questions/54308893/problem-using-ioredis-scanstream-to-scan-through-all-redis-keys
    async get_pattern(pattern) {
        const stream = this.redis.scanStream({
            match: pattern,
        })
        // count: 10
        return new Promise((resolve, reject) => {
            let keysArray = []
            stream
                .on("data", (keys = []) => {
                    if (keys.length) {
                        keysArray = [...keys]
                    }
                })
                .on("error", (err) => reject(err))
                .on("end", () => resolve(keysArray))
        })
    }
}
