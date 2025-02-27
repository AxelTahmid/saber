import { Type } from "@sinclair/typebox"
import type { FastifySchema } from "fastify"
import { replyObj } from "../../config/schema.js"

/* ---------------------------------------------
    Reusable Definitions
--------------------------------------------- */
export namespace Data {
    export const galleryContentObj = Type.Object({
        Key: Type.Optional(Type.String()),
        LastModified: Type.Optional(Type.String({ format: "date" })),
        ETag: Type.Optional(Type.String()),
        Size: Type.Optional(Type.Number()),
        Url: Type.Optional(Type.String()),
    })

    export const galleryResponseObj = Type.Object({
        Prefix: Type.Optional(Type.String()),
        Name: Type.Optional(Type.String()),
        IsTruncated: Type.Optional(Type.Boolean()),
        Contents: Type.Optional(Type.Array(galleryContentObj)),
    })

    export const keyQueryParam = Type.Object({ Key: Type.String() })

    export const destroyManyBody = Type.Object({
        Objects: Type.Optional(Type.Array(Type.Object({ Key: Type.String() }))),
    })
}

/* ---------------------------------------------
    Fastify Route Schemas for Gallery
--------------------------------------------- */
export namespace RouteSchema {
    /**
     * GET /v1/gallery/
     */
    export const gallery: FastifySchema = {
        description: "List gallery images",
        tags: ["gallery"],
        response: { 200: replyObj(Data.galleryResponseObj) },
    }

    /**
     * POST /v1/gallery/upload
     */
    export const upload: FastifySchema = {
        description: "Upload a gallery image",
        tags: ["gallery"],
        querystring: Data.keyQueryParam,
        response: { 201: replyObj(null) },
    }

    /**
     * DELETE /v1/gallery/?Key=keyname
     */
    export const destroy: FastifySchema = {
        description: "Delete a gallery image",
        tags: ["gallery"],
        querystring: Data.keyQueryParam,
        response: { 201: replyObj(null) },
    }

    /**
     * DELETE /v1/gallery/selected
     */
    export const destroyMany: FastifySchema = {
        description: "Delete multiple gallery image",
        tags: ["gallery"],
        body: Data.destroyManyBody,
        response: { 201: replyObj(null) },
    }

    /**
     * GET /v1/gallery/flush
     */
    export const flush: FastifySchema = {
        description: "Flush redis cache of images",
        tags: ["gallery"],
        response: { 200: replyObj(null) },
    }
}
