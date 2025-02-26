import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply } from "fastify"
import authRoutes from "./auth/routes.js"
import rootRoutes from "./base/routes.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    app.setNotFoundHandler(
        {
            preHandler: app.rateLimit({
                max: 3,
                timeWindow: 1000 * 60,
            }),
        },
        (_, reply: FastifyReply) => {
            reply.code(500).send({ error: true, message: "Route Not Found" })
        },
    )

    app.register(rootRoutes)

    app.register(authRoutes, { prefix: "/v1/auth" })
}

export default routes
