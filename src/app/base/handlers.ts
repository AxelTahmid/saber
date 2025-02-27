import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import type { QueueBody } from "./types.js"

class BaseHandler {
    private fastify: FastifyInstance

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify
    }

    /**
     * GET /base - Returns API welcome info along with memory usage.
     */
    public base = async (request: FastifyRequest, reply: FastifyReply) => {
        const status = this.fastify.memoryUsage()

        reply.code(200)
        return {
            label: "Welcome to API",
            uptime: process.uptime(),
            version: process.version,
            status,
        }
    }

    /**
     * GET /otp-keys - Retrieves OTP keys from the cache.
     */
    public otpKeys = async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await this.fastify.cache.get_pattern("otp*")

        reply.code(200)
        return {
            error: false,
            message: data.length ? "All OTP in circulation" : "No OTP in ciruclation",
            data,
        }
    }

    /**
     * POST /redis-data - Retrieves Redis data for a given key.
     */
    public redisData = async (request: FastifyRequest, reply: FastifyReply) => {
        const key = (request.body as { key: string }).key
        const data = await this.fastify.cache.get(key)

        reply.code(200)
        return {
            error: false,
            message: `Data for Redis ${key}`,
            data,
        }
    }

    /**
     * POST /flush-redis - Flushes all Redis keys matching a pattern.
     */
    public flushRedis = async (request: FastifyRequest, reply: FastifyReply) => {
        await this.fastify.cache.flush_pattern("*")

        reply.code(200)
        return {
            error: false,
            message: "Redis globally flushed",
        }
    }

    /**
     * POST /queue-action - Performs an action on BullMQ queue.
     */
    public queueAction = async (request: FastifyRequest<{ Body: QueueBody }>, reply: FastifyReply) => {
        const action = request.body?.action

        if (this.fastify.queue) {
            switch (action) {
                case "drain":
                    await this.fastify.queue.drain()

                    break

                case "clean":
                    if (this.fastify.queue) {
                        await this.fastify.queue.clean(60000, 1000, "paused")
                    }
                    break

                case "obliterate":
                    if (this.fastify.queue) {
                        await this.fastify.queue.obliterate()
                    }
                    break
            }
        }

        reply.code(200)
        return {
            error: false,
            message: `BullMQ Action - ${action} performed successfully`,
        }
    }
}

export default BaseHandler
