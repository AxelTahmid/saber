import type { FastifyPluginAsync, FastifyPluginOptions, FastifyInstance } from "fastify"
import conf from "@config/environment.js"
import fastifyMultipart from "@fastify/multipart"

import s3object from "@plugins/s3object.js"
import handler from "@gallery/handlers.js"
import schema from "@gallery/schema.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    app.register(fastifyMultipart, conf.storage.multer)

    const s3credentials = {
        ...conf.storage.connection,
        // requestHandler: app.request,
        // logger: app.log,
    }

    app.register(s3object, s3credentials)

    app.route({
        method: "GET",
        url: "/",
        schema: schema.gallery,
        handler: handler.gallery,
    })

    app.route({
        method: "PUT",
        url: "/upload",
        onRequest: app.role.restricted,
        schema: schema.upload,
        handler: handler.upload,
    })

    app.route({
        method: "POST",
        url: "/flush",
        onRequest: app.role.restricted,
        schema: schema.flush,
        handler: handler.flush,
    })

    app.route({
        method: "DELETE",
        url: "/selected",
        onRequest: app.role.restricted,
        schema: schema.destroyMany,
        handler: handler.destroyMany,
    })

    app.route({
        method: "DELETE",
        url: "/",
        onRequest: app.role.restricted,
        schema: schema.destroy,
        handler: handler.destroy,
    })
}

export default routes
