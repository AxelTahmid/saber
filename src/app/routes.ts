import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply } from "fastify"
import authRoutes from "@app/auth/routes.js"
import rootRoutes from "@app/base/routes.js"
import galleryRoutes from "@app/gallery/routes.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    // Avoid bots crawling urls. No 404, Be smart. Confuse them.
    app.setNotFoundHandler((_, reply: FastifyReply) => {
        reply.code(500).send({ error: true, message: "Unknown Server Error" })
    })

    app.register(rootRoutes)
    app.register(authRoutes, { prefix: "/v1/auth" })
    app.register(galleryRoutes, { prefix: "/v1/gallery" })
}

export default routes
