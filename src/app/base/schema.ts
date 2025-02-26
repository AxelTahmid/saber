import { Type } from "@sinclair/typebox"
import { replyObj } from "../../config/schema.js"

// In Fluent JSON Schema, none of the properties in baseResponse were marked as required,
// so they are optional. In TypeBox, we mark them as optional using Type.Optional.
export const baseResponse = Type.Object({
    label: Type.Optional(Type.String()),
    uptime: Type.Optional(Type.Number()),
    version: Type.Optional(Type.String()),
    status: Type.Optional(
        Type.Object({
            rssBytes: Type.Optional(Type.Number()),
            heapUsed: Type.Optional(Type.Number()),
            eventLoopDelay: Type.Optional(Type.Number()),
            eventLoopUtilized: Type.Optional(Type.Number()),
        }),
    ),
})

// For queueBody, the "action" property is explicitly marked as required,
// so we leave it as required. We define the enum as a union of literal types.
export const queueBody = Type.Object({
    action: Type.Union([Type.Literal("drain"), Type.Literal("clean"), Type.Literal("obliterate")]),
})

/**
 * * Schema GET /
 */
export const base = {
    response: {
        200: baseResponse,
    },
}

/**
 * * Schema GET /otp
 */
export const arrayofString = {
    response: {
        200: replyObj(Type.Array(Type.String())),
    },
}
/**
 * * Schema POST /queue
 */
export const queueAction = {
    body: queueBody,
    response: {
        200: replyObj(null),
    },
}

export default { base, arrayofString, queueAction }
