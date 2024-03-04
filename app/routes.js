import authAdminRoutes from "./auth/admin/auth.routes.js"
import authPublicRoutes from "./auth/public/auth.routes.js"
import rootRoutes from "./base/routes.js"

export default function routes(app) {
    app.setNotFoundHandler(
        {
            preHandler: app.rateLimit({
                max: 3,
                timeWindow: 1000 * 60,
            }),
        },
        (request, reply) => {
            reply.code(404).send({ error: true, message: "404 - Route Not Found" })
        },
    )

    app.register(rootRoutes)

    app.register(authPublicRoutes, { prefix: "/v1/auth" })
    app.register(authAdminRoutes, { prefix: "/v1/admin/auth" })
}
