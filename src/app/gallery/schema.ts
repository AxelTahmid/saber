import { type Static, Type } from "@sinclair/typebox"
import { replyObj } from "../../config/schema.js"

const contentObj = Type.Object({
    Key: Type.Optional(Type.String()),
    LastModified: Type.Optional(Type.String({ format: "date" })),
    ETag: Type.Optional(Type.String()),
    Size: Type.Optional(Type.Number()),
    Url: Type.Optional(Type.String()),
})

const galleryResponseObj = Type.Object({
    Prefix: Type.Optional(Type.String()),
    Name: Type.Optional(Type.String()),
    IsTruncated: Type.Optional(Type.Boolean()),
    Contents: Type.Optional(Type.Array(contentObj)),
})

const KeyQueryParam = Type.Object({ Key: Type.String() })

const destroyManyBody = Type.Object({
    Objects: Type.Optional(Type.Array(Type.Object({ Key: Type.String() }))),
})

export type DestroyMany = Static<typeof destroyManyBody>
/**
 * * Schema GET /v1/gallery/
 */
const gallery = {
    response: { 200: replyObj(galleryResponseObj) },
}
/**
 * * Schema POST /v1/gallery/upload
 */
const upload = {
    query: KeyQueryParam,
    response: { 201: replyObj(null) },
}
/**
 * * Schema DELETE /v1/gallery/?Key=keyname
 */
const destroy = {
    query: KeyQueryParam,
    response: { 201: replyObj(null) },
}
/**
 * * Schema DELETE /v1/gallery/selected
 */
const destroyMany = {
    body: destroyManyBody,
    response: { 201: replyObj(null) },
}

const flush = {
    response: { 200: replyObj(null) },
}

export default {
    gallery,
    upload,
    destroy,
    destroyMany,
    flush,
}
