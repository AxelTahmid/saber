const { default: fastifyMultipart } = require('@fastify/multipart')
const s3object = require('../../plugins/s3object')
const { storage } = require('../../config/environment')

const galleryHandler = require('./gallery.handlers')
const gallerySchema = require('./gallery.schema')
const { s_flush } = require('../../config/schema')

module.exports = async function (fastify) {
    fastify.register(fastifyMultipart, {
        limits: storage.multer
    })

    const s3credentials = {
        requestHandler: fastify.request,
        ...storage.connection
        // logger: fastify.log,
    }

    fastify.register(s3object, s3credentials)

    fastify.route({
        method: 'GET',
        url: '/',
        schema: gallerySchema.s_gallery,
        handler: galleryHandler.gallery
    })

    fastify.route({
        method: 'PUT',
        url: '/upload',
        onRequest: fastify.role.restricted,
        schema: gallerySchema.s_upload,
        handler: galleryHandler.upload
    })

    fastify.route({
        method: 'POST',
        url: '/flush',
        onRequest: fastify.role.restricted,
        schema: s_flush,
        handler: galleryHandler.flush
    })

    fastify.route({
        method: 'DELETE',
        url: '/selected',
        onRequest: fastify.role.restricted,
        schema: gallerySchema.s_destroyMany,
        handler: galleryHandler.destroyMany
    })

    fastify.route({
        method: 'DELETE',
        url: '/',
        onRequest: fastify.role.restricted,
        schema: gallerySchema.s_destroy,
        handler: galleryHandler.destroy
    })
}
