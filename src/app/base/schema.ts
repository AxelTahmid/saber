import { Type } from "@sinclair/typebox"
import type { FastifySchema } from "fastify"
import { replyObj } from "../../config/schema.js"

/* ---------------------------------------------
    Reusable Definitions
--------------------------------------------- */
export namespace Data {
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

    export const queueBody = Type.Object({
        action: Type.Union([Type.Literal("drain"), Type.Literal("clean"), Type.Literal("obliterate")]),
    })
}

/* ---------------------------------------------
    Fastify Route Schemas
--------------------------------------------- */
export namespace RouteSchema {
    /**
     * GET /
     * Health status of application.
     */
    export const base: FastifySchema = {
        description: "Health status of application",
        tags: ["base"],
        response: { 200: Data.baseResponse },
    }

    /**
     * GET /otp
     * Retrieve an array of OTP codes in circulation.
     */
    export const arrayofString: FastifySchema = {
        description: "Get OTP codes in circulation",
        tags: ["base"],
        response: { 200: replyObj(Type.Array(Type.String())) },
    }

    /**
     * POST /queue
     * Perform an action on the queue (e.g. drain, clean, obliterate).
     */
    export const queueAction: FastifySchema = {
        description: "Perform action on queue, i.e. Drain etc",
        tags: ["base"],
        body: Data.queueBody,
        response: { 200: replyObj(null) },
    }
}
