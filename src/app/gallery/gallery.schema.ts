import { S } from "fluent-json-schema"

import { responseObject } from "../../config/schema"

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
const s_gallery = {
    response: { 200: responseObject(galleryResponseObj) },
}
/**
 * * Schema POST /v1/gallery/upload
 */
const s_upload = {
    query: S.object().prop("Key", S.string().required()),
    response: { 201: responseObject() },
}
/**
 * * Schema DELETE /v1/gallery/?Key=keyname
 */
const s_destroy = {
    query: S.object().prop("Key", S.string().required()),
    response: { 201: responseObject() },
}
/**
 * * Schema DELETE /v1/gallery/selected
 */
const s_destroyMany = {
    body: S.object().prop("Objects", S.array().items(S.object().prop("Key", S.string().required()))),
    response: { 201: responseObject() },
}

export default {
    s_gallery,
    s_upload,
    s_destroy,
    s_destroyMany,
}
