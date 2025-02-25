const base = async function (request, reply) {
    const status = this.memoryUsage()

    reply.code(200)
    return {
        label: "Welcome to API",
        uptime: process.uptime(),
        version: process.version,
        status,
    }
}

const otpKeys = async function (request, reply) {
    const data = await this.cache.get_pattern("otp*")

    reply.code(200)
    return {
        error: false,
        message: data.length ? "All OTP in circulation" : "No OTP in ciruclation",
        data,
    }
}

const redisData = async function (request, reply) {
    const key = request.body.key

    const data = await this.cache.get(key)

    reply.code(200)
    return {
        error: false,
        message: `Data for Redis ${key}`,
        data,
    }
}

const flushRedis = async function (request, reply) {
    await this.cache.flush_pattern("*")

    reply.code(200)
    return {
        error: false,
        message: "Redis globally flushed",
    }
}

const queueAction = async function (request, reply) {
    const action = request.body?.action

    switch (action) {
        case "drain":
            await this.queue.drain()
            break

        case "clean":
            await this.queue.clean(
                60000, // 1 minute
                1000, // max number of jobs to clean
                "paused",
            )
            break

        case "obliterate":
            await this.queue.obliterate()
            break
    }

    reply.code(200)
    return {
        error: false,
        message: `BullMQ Action - ${action} performed successfully`,
    }
}

export default {
    base,
    otpKeys,
    redisData,
    flushRedis,
    queueAction,
}
