import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

declare module "fastify" {
    interface FastifyInstance {
        s3: S3Client
    }
}

async function s3client(fastify: FastifyInstance, opts: S3ClientConfig) {
    if (!fastify.s3) {
        const client = new S3Client(opts)
        fastify.decorate("s3", client)

        // *maybe not needed, fastify request instance used in config
        fastify.addHook("onClose", (fastify, _) => {
            if (fastify.s3) {
                fastify.s3.destroy()
            }
        })
    }
}

export default fp(s3client, {
    name: "s3-client",
})
