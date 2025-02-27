import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { Redis, type RedisOptions } from "ioredis"

declare module "fastify" {
    interface FastifyInstance {
        redis: Redis
        cache: CacheService
    }
}

async function fastifyRedis(fastify: FastifyInstance, options: RedisOptions | string) {
    const redis = new Redis(options as RedisOptions)

    redis.on("connect", () => {
        fastify.log.info("Redis Connected")
    })

    redis.on("error", (err: Error) => {
        fastify.log.error(err, "Redis connection error")
    })

    redis.on("close", () => {
        fastify.log.warn("Redis connection closed")
    })

    redis.on("reconnecting", () => {
        fastify.log.info("Redis attempting to reconnect")
    })

    if (!fastify.hasDecorator("redis")) {
        fastify.decorate("redis", redis)
    }

    if (!fastify.hasDecorator("cache")) {
        fastify.decorate("cache", new CacheService(redis))
    }

    fastify.addHook("onClose", async (instance) => {
        await instance.redis.quit()
    })
}

export default fp(fastifyRedis, {
    fastify: ">=5.0.0",
    name: "redis",
})

class CacheService {
    private redis: Redis
    constructor(redis: Redis) {
        this.redis = redis
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    async get(key: string, parse = true): Promise<any> {
        const data = await this.redis.get(key)
        if (data) {
            return parse ? JSON.parse(data) : data
        }
        return false
    }

    async set(
        key: string,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        data: any,
        stringify = true,
        exp = 300,
    ): Promise<void> {
        if (stringify) {
            await this.redis.set(key, JSON.stringify(data), "EX", exp)
        } else {
            await this.redis.set(key, data, "EX", exp)
        }
    }

    async flush(keys: string | string[]): Promise<number> {
        return this.redis.del(Array.isArray(keys) ? keys : [keys])
    }

    async flush_pattern(pattern: string): Promise<string> {
        const stream = this.redis.scanStream({ match: pattern })
        return new Promise((resolve, reject) => {
            stream
                .on("data", (keys: string[] = []) => {
                    if (keys.length) {
                        const pipeline = this.redis.pipeline()
                        keys.forEach((key: string) => pipeline.del(key))
                        pipeline.exec()
                    }
                })
                .on("error", (err: Error) => reject(err))
                .on("end", () => resolve(`Cache cleared on: ${pattern}`))
        })
    }

    async get_pattern(pattern: string): Promise<string[]> {
        const stream = this.redis.scanStream({ match: pattern })
        return new Promise((resolve, reject) => {
            let keysArray: string[] = []
            stream
                .on("data", (keys: string[] = []) => {
                    if (keys.length) {
                        // Append keys to the array so that all matching keys are captured.
                        keysArray = keysArray.concat(keys)
                    }
                })
                .on("error", (err: Error) => reject(err))
                .on("end", () => resolve(keysArray))
        })
    }
}
