/**
 * * Cache Utility, Decorated and injected with redis
 */
export default class CacheUtility {
    super(redis) {
        this.redis = redis
    }

    async get(key) {
        const data = await this.redis.get(key)
        return data ? JSON.parse(data) : false
    }

    async set(key, data, convert = true) {
        if (convert) {
            await this.redis.set(key, JSON.stringify(data))
        } else {
            await this.redis.set(key, data)
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
