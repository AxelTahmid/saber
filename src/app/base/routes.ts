import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify"
import helper from "./handlers.js"
import schema from "./schema.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    app.route({
        method: "GET",
        url: "/",
        schema: schema.base,
        handler: helper.base,
    })

    app.route({
        method: "POST",
        url: "/otp",
        onRequest: app.role.restricted,
        schema: schema.arrayofString,
        handler: helper.otpKeys,
    })

    app.route({
        method: "POST",
        url: "/redis",
        onRequest: app.role.restricted,
        handler: helper.redisData,
    })

    app.route({
        method: "POST",
        url: "/queue",
        onRequest: app.role.restricted,
        schema: schema.queueAction,
        handler: helper.queueAction,
    })

    app.route({
        method: "POST",
        url: "/flush",
        onRequest: app.role.restricted,
        handler: helper.flushRedis,
    })
}

export default routes
