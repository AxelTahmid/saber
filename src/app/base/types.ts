import type { Static } from "@sinclair/typebox"
import type { Data } from "./schema.js"

export type QueueBody = Static<typeof Data.queueBody>
