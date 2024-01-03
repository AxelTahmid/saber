import rootRoutes from './base/handlers.js'
import authPublicRoutes from './auth/public/auth.routes.js'
import authAdminRoutes from './auth/admin/auth.routes.js'

export default async app => {
    app.setNotFoundHandler(
        {
            preHandler: app.rateLimit({
                max: 3,
                timeWindow: 1000 * 60
            })
        },
        function (request, reply) {
            reply
                .code(404)
                .send({ error: true, message: '404 - Route Not Found' })
        }
    )

    app.register(rootRoutes)

    app.register(authPublicRoutes, { prefix: '/v1/auth' })
    app.register(authAdminRoutes, { prefix: '/v1/admin/auth' })
}