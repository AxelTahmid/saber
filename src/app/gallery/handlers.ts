/**
 * * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html
 * * https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/s3/README.md
 */
import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3"

import conf from "../../config/environment.js"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { DestroyMany } from "./schema.js"
/**
 * * Handler GET /v1/gallery/flush
 */
const flush = async function (request: FastifyRequest, reply: FastifyReply) {
    await this.cache.flush("gallery:list")

    reply.code(200)
    return {
        error: false,
        message: "Media Cache Removed",
    }
}
/**
 * * Handler GET /v1/gallery/
 */
const gallery = async function (request: FastifyRequest, reply: FastifyReply) {
    const key = "gallery:list"

    let data = await this.cache.get(key)

    if (!data) {
        data = await this.s3.send(new ListObjectsCommand({ Bucket: conf.storage.bucket }))

        data.Contents.forEach((c: any) => {
            c.Url = `${conf.storage.connection.endpoint}/${conf.storage.bucket}/${c.Key}`
        })
        await this.cache.set(key, data)
    }

    reply.code(200)
    return {
        error: false,
        message: "Media List Fetched!",
        data,
    }
}
/**
 * * Handler POST /v1/gallery/upload
 * * will upload or update on key
 */
const upload = async function (request: FastifyRequest, reply: FastifyReply) {
    const { Key } = request.query

    const data = await request.file()
    const buffer = await data?.toBuffer()

    const allowedMimes = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/svg+xml"]

    if (!allowedMimes.includes(data.mimetype)) {
        throw this.httpErrors.notAcceptable(`Type: ${data.mimetype} not allowed!`)
    }

    const uploadParams = {
        Bucket: conf.storage.bucket,
        Key,
        CacheControl: "public,max-age=2628000,s-maxage=2628000",
        Body: buffer,
    }

    await this.s3.send(new PutObjectCommand(uploadParams))
    await this.cache.flush("gallery:list")

    reply.code(201)
    return {
        error: false,
        message: "Media Created",
    }
}

/**
 * * Handler DELETE /v1/gallery/:key
 */
const destroy = async function (request: FastifyRequest<{ Body: DestroyMany }>, reply: FastifyReply) {
    const { Key } = request.query

    await this.s3.send(new DeleteObjectCommand({ Bucket: conf.storage.bucket, Key }))
    await this.cache.flush("gallery:list")

    reply.code(201)
    return {
        error: false,
        message: `Media: ${Key} deleted.`,
    }
}

/**
 * * Handler DELETE /v1/gallery/:key
 */
const destroyMany = async function (request: FastifyRequest, reply: FastifyReply) {
    await this.s3.send(
        new DeleteObjectsCommand({
            Bucket: conf.storage.bucket,
            Delete: request.body,
        }),
    )
    await this.cache.flush("gallery:list")

    reply.code(201)
    return {
        error: false,
        message: "Selected Files deleted",
    }
}

export default { flush, gallery, upload, destroy, destroyMany }
