import { fastify, type FastifyPluginAsync, type FastifyPluginOptions, type FastifyInstance } from "fastify"
import conf from "@config/environment.js"
import fastifyMultipart from "@fastify/multipart"

import s3object from "@plugins/s3object.js"
import handler from "@gallery/handlers.js"
import schema from "@gallery/schema.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    fastify.register(fastifyMultipart, conf.storage.multer)

    const s3credentials = {
        requestHandler: fastify.request,
        ...conf.storage.connection,
        // logger: fastify.log,
    }

    fastify.register(s3object, s3credentials)

    fastify.route({
        method: "GET",
        url: "/",
        schema: schema.gallery,
        handler: handler.gallery,
    })

    fastify.route({
        method: "PUT",
        url: "/upload",
        onRequest: fastify.role.restricted,
        schema: schema.upload,
        handler: handler.upload,
    })

    fastify.route({
        method: "POST",
        url: "/flush",
        onRequest: fastify.role.restricted,
        schema: schema.flush,
        handler: handler.flush,
    })

    fastify.route({
        method: "DELETE",
        url: "/selected",
        onRequest: fastify.role.restricted,
        schema: schema.destroyMany,
        handler: handler.destroyMany,
    })

    fastify.route({
        method: "DELETE",
        url: "/",
        onRequest: fastify.role.restricted,
        schema: schema.destroy,
        handler: handler.destroy,
    })
}

export default routes
