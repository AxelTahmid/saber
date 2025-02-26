import fp from "fastify-plugin"

import { Queue, Worker } from "bullmq"
import type { BullMQConfig } from "@config/environment.js"

import mailProcessor from "@mail/index.js"

import type { FastifyInstance } from "fastify"

declare module "fastify" {
    interface FastifyInstance {
        queue?: Queue
        worker?: Worker
    }
}

async function fastifyBullMQ(app: FastifyInstance, opts: BullMQConfig) {
    if (!app.queue) {
        const queue = new Queue(opts.queue, {
            connection: opts.redis,
            defaultJobOptions: opts.job_options,
        })

        app.decorate("queue", queue)
    }

    if (!app.worker) {
        const worker = new Worker(opts.queue, mailProcessor, opts.worker_options)

        app.decorate("worker", worker)

        worker.on("completed", (job, returnvalue) => {
            app.log.info({ job, returnvalue }, "Job Completed")
        })

        worker.on("failed", (job, error) => {
            app.log.error({ job, error }, "Job Failed")
        })

        worker.on("error", (error) => {
            app.log.error({ error }, "Unhandled Exception Thrown by Worker")
            throw new Error(error.message)
        })

        worker.on("drained", () => {
            app.log.info(`${opts.queue} - is drained, no more jobs left`)
        })

        // worker.run()

        // no needed to close queue, global
        app.addHook("onClose", (app, done) => {
            if (app.worker === worker) {
                app.worker.close()
            }
        })
    }
}

export default fp(fastifyBullMQ, {
    fastify: ">=5.0.0",
    name: "bullmq",
})
