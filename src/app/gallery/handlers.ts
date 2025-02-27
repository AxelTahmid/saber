/**
 * * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html
 * * https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/s3/README.md
 */
import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import conf from "../../config/environment.js"
import type { DestroyMany, Gallery, KeyQueryString } from "./types.js"

class GalleryHandler {
    private fastify: FastifyInstance

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify
    }

    /**
     * GET /v1/gallery/flush
     */
    public flush = async (req: FastifyRequest, reply: FastifyReply) => {
        await this.fastify.cache.flush("gallery:list")

        reply.code(200)
        return {
            error: false,
            message: "Media Cache Removed",
        }
    }

    /**
     * GET /v1/gallery/
     */
    public gallery = async (req: FastifyRequest, reply: FastifyReply) => {
        const key = "gallery:list"

        let data = await this.fastify.cache.get(key)

        if (!data) {
            data = await this.fastify.s3.send(new ListObjectsCommand({ Bucket: conf.storage.bucket }))

            data.Contents.forEach((c: Gallery) => {
                c.Url = `${conf.storage.connection.endpoint}/${conf.storage.bucket}/${c.Key}`
            })
            await this.fastify.cache.set(key, data)
        }

        reply.code(200)
        return {
            error: false,
            message: "Media List Fetched!",
            data,
        }
    }

    /**
     * POST /v1/gallery/upload
     * Uploads (or updates) a media file on S3.
     */
    public upload = async (req: FastifyRequest<{ Querystring: KeyQueryString }>, reply: FastifyReply) => {
        const { Key } = req.query
        const data = await req.file()
        const buffer = await data?.toBuffer()

        const allowedMimes = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/svg+xml"]

        if (!allowedMimes.includes(data?.mimetype || "")) {
            throw this.fastify.httpErrors.notAcceptable(`Type: ${data?.mimetype} not allowed!`)
        }

        const uploadParams = {
            Bucket: conf.storage.bucket,
            Key,
            CacheControl: "public,max-age=2628000,s-maxage=2628000",
            Body: buffer,
        }

        await this.fastify.s3.send(new PutObjectCommand(uploadParams))
        await this.fastify.cache.flush("gallery:list")

        reply.code(201)
        return {
            error: false,
            message: "Media Created",
        }
    }

    /**
     * DELETE /v1/gallery/:key
     * Deletes a single media file from S3.
     */
    public destroy = async (req: FastifyRequest<{ Querystring: KeyQueryString }>, reply: FastifyReply) => {
        const { Key } = req.query

        await this.fastify.s3.send(new DeleteObjectCommand({ Bucket: conf.storage.bucket, Key }))
        await this.fastify.cache.flush("gallery:list")

        reply.code(201)
        return {
            error: false,
            message: `Media: ${Key} deleted.`,
        }
    }

    /**
     * DELETE /v1/gallery/:key
     * Deletes multiple media files from S3.
     */
    public destroyMany = async (req: FastifyRequest<{ Body: DestroyMany }>, reply: FastifyReply) => {
        await this.fastify.s3.send(
            new DeleteObjectsCommand({
                Bucket: conf.storage.bucket,
                Delete: req.body,
            }),
        )
        await this.fastify.cache.flush("gallery:list")

        reply.code(201)
        return {
            error: false,
            message: "Selected Files deleted",
        }
    }
}

export default GalleryHandler
