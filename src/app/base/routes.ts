import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify"
import BaseHandler from "./handlers.js"
import { RouteSchema } from "./schema.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    const baseHandler = new BaseHandler(app)

    app.route({
        method: "GET",
        url: "/",
        schema: RouteSchema.base,
        handler: baseHandler.base,
    })

    app.route({
        method: "POST",
        url: "/otp",
        onRequest: app.role.restricted,
        schema: RouteSchema.arrayofString,
        handler: baseHandler.otpKeys,
    })

    app.route({
        method: "POST",
        url: "/redis",
        onRequest: app.role.restricted,
        handler: baseHandler.redisData,
    })

    app.route({
        method: "POST",
        url: "/queue",
        onRequest: app.role.restricted,
        schema: RouteSchema.queueAction,
        handler: baseHandler.queueAction,
    })

    app.route({
        method: "POST",
        url: "/flush",
        onRequest: app.role.restricted,
        handler: baseHandler.flushRedis,
    })
}

export default routes
