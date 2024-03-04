import { S } from "fluent-json-schema"
import { responseObject } from "../../config/schema.js"

/**
 * * Schema GET /
 */
export const base = {
    response: {
        200: S.object()
            .prop("label", S.string())
            .prop("uptime", S.number())
            .prop("version", S.string())
            .prop(
                "status",
                S.object()
                    .prop("rssBytes", S.number())
                    .prop("heapUsed", S.number())
                    .prop("eventLoopDelay", S.number())
                    .prop("eventLoopUtilized", S.number()),
            ),
    },
}

/**
 * * Schema GET /otp
 */
export const arrayofString = {
    response: {
        200: responseObject(S.array().items(S.string())),
    },
}
/**
 * * Schema POST /queue
 */
export const queueAction = {
    body: S.object().prop("action", S.enum(["drain", "clean", "obliterate"]).required()),
    response: {
        200: responseObject(),
    },
}

export default { base, arrayofString, queueAction }
