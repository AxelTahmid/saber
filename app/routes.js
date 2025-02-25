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
            reply.code(500).send({ error: true, message: "Route Not Found" })
        },
    )

    app.register(rootRoutes)

    app.register(authRoutes, { prefix: "/v1/auth" })
}
