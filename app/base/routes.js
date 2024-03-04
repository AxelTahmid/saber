import helper from "./handlers.js"
import schema from "./schema.js"

export default function base(fastify, done) {
    fastify.route({
        method: "GET",
        url: "/",
        schema: schema.base,
        handler: helper.base,
    })

    fastify.route({
        method: "POST",
        url: "/otp",
        onRequest: fastify.role.restricted,
        schema: schema.arrayofString,
        handler: helper.otpKeys,
    })

    fastify.route({
        method: "POST",
        url: "/redis",
        onRequest: fastify.role.restricted,
        handler: helper.redisData,
    })

    fastify.route({
        method: "POST",
        url: "/queue",
        onRequest: fastify.role.restricted,
        schema: schema.queueAction,
        handler: helper.queueAction,
    })

    fastify.route({
        method: "POST",
        url: "/flush",
        onRequest: fastify.role.restricted,
        handler: helper.flushRedis,
    })

    done()
}
