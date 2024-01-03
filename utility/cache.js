/**
 * * Cache Utility, Decorated and injected with redis
 */
module.exports = context => {
    return {
        get: async function (key) {
            const data = await context.get(key)
            return data ? JSON.parse(data) : false
        },
        set: async function (key, data, convert = true) {
            if (convert) {
                await context.set(key, JSON.stringify(data))
            } else {
                await context.set(key, data)
            }
        },
        flush: async function (keys) {
            await context.del(keys)
        },
        flush_pattern: async function (pattern) {
            const stream = context.scanStream({
                match: pattern
            })

            return new Promise((resolve, reject) => {
                stream
                    .on('data', (keys = []) => {
                        if (keys.length) {
                            const pipeline = context.pipeline()
                            keys.forEach(key => pipeline.del(key))
                            pipeline.exec()
                        }
                    })
                    .on('error', err => reject(err))
                    .on('end', () => resolve(`Cache cleared on: ${pattern}`))
            })
        },
        // * https://stackoverflow.com/questions/54308893/problem-using-ioredis-scanstream-to-scan-through-all-redis-keys
        get_pattern: async function (pattern) {
            const stream = context.scanStream({
                match: pattern
            })
            // count: 10
            return new Promise((resolve, reject) => {
                let keysArray = []
                stream
                    .on('data', (keys = []) => {
                        if (keys.length) {
                            keysArray = [...keys]
                        }
                    })
                    .on('error', err => reject(err))
                    .on('end', () => resolve(keysArray))
            })
        }
    }
}
