const rootRoutes = require('./base/handlers')
const authPublicRoutes = require('./auth/public/auth.routes')
const authAdminRoutes = require('./auth/admin/auth.routes')

module.exports = async function (app) {
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
    /**
     * * entrypoint routes
     */
    /**
     * * Service Routes Registration with Prefix
     */
    app.register(rootRoutes)
        .register(authPublicRoutes, { prefix: '/v1/auth' })
        .register(authAdminRoutes, { prefix: '/v1/admin/auth' })
}
