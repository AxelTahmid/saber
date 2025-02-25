import authRoutes from "./auth/routes.js"
import rootRoutes from "./base/routes.js"

export default function routes(app) {
    app.setNotFoundHandler(
        {
            preHandler: app.rateLimit({
                max: 3,
                timeWindow: 1000 * 60,
            }),
        },
        (_, reply) => {
            reply.code(404).send({ error: true, message: "404 - Route Not Found" })
        },
    )

    app.register(rootRoutes)

    app.register(authRoutes, { prefix: "/auth" })
}
