import { S3Client } from "@aws-sdk/client-s3"
import fp from "fastify-plugin"

async function s3client(fastify, opts, next) {
    try {
        if (!fastify.s3) {
            const client = new S3Client(opts)
            fastify.decorate("s3", client)

            // *maybe not needed, fastify request instance used in config
            fastify.addHook("onClose", (fastify, done) => {
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

export default fp(s3client, {
    name: "s3-client",
})
