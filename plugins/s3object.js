const fp = require('fastify-plugin')
const { S3Client } = require('@aws-sdk/client-s3')

const s3object = async function (fastify, opts, next) {
    try {
        if (!fastify.s3) {
            const client = new S3Client(opts)
            fastify.decorate('s3', client)

            // *maybe not needed, fastify request instance used in config
            fastify.addHook('onClose', (fastify, done) => {
                if (fastify.s3) {
                    fastify.s3.destroy(done)
                }
            })
        }

        next()
    } catch (err) {
        next(err)
    }
}

module.exports = fp(s3object, {
    name: 'fastify-s3'
})
