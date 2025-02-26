import { S } from "fluent-json-schema"

import { replyObj } from "../../config/schema.js"

const contentObj = S.object()
    .prop("Key", S.string())
    .prop("LastModified", S.string().format("date"))
    .prop("ETag", S.string())
    .prop("Size", S.number())
    .prop("Url", S.string())

const galleryResponseObj = S.object()
    .prop("Prefix", S.string())
    .prop("Name", S.string())
    .prop("IsTruncated", S.boolean())
    .prop("Contents", S.array().items(contentObj))

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
    query: S.object().prop("Key", S.string().required()),
    response: { 201: replyObj() },
}
/**
 * * Schema DELETE /v1/gallery/?Key=keyname
 */
const destroy = {
    query: S.object().prop("Key", S.string().required()),
    response: { 201: replyObj() },
}
/**
 * * Schema DELETE /v1/gallery/selected
 */
const destroyMany = {
    body: S.object().prop("Objects", S.array().items(S.object().prop("Key", S.string().required()))),
    response: { 201: replyObj() },
}

const flush = {
    response: { 200: replyObj() },
}

export default {
    gallery,
    upload,
    destroy,
    destroyMany,
    flush,
}
