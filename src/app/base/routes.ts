import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify"
import handler from "./handlers.js"
import schema from "./schema.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    app.route({
        method: "GET",
        url: "/",
        schema: schema.base,
        handler: handler.base,
    })

    app.route({
        method: "POST",
        url: "/otp",
        onRequest: app.role.restricted,
        schema: schema.arrayofString,
        handler: handler.otpKeys,
    })

    app.route({
        method: "POST",
        url: "/redis",
        onRequest: app.role.restricted,
        handler: handler.redisData,
    })

    app.route({
        method: "POST",
        url: "/queue",
        onRequest: app.role.restricted,
        schema: schema.queueAction,
        handler: handler.queueAction,
    })

    app.route({
        method: "POST",
        url: "/flush",
        onRequest: app.role.restricted,
        handler: handler.flushRedis,
    })
}

export default routes
