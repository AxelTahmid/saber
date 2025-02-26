import type { FastifyInstance, FastifyReply, FastifyRegisterOptions, RouteOptions } from "fastify"
import authRoutes from "./auth/routes.js"
import rootRoutes from "./base/routes.js"

export default function routes(app: FastifyInstance, opts: RouteOptions, done: () => void) {
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

    app.register(authRoutes, { prefix: "/v1/auth" } as FastifyRegisterOptions)
}
