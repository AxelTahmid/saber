import fp from "fastify-plugin"

import { Queue, Worker } from "bullmq"

import jobProcessor from "../app/mail/index.js"

async function fastifyBullMQ(fastify, opts, next) {
    try {
        if (!fastify.queue) {
            const queue = new Queue(opts.queue, {
                connection: opts.redis,
                defaultJobOptions: opts.job_options,
            })

            fastify.decorate("queue", queue)

            fastify.queue.on("error", (err) => {
                fastify.log.error({ err }, "Queue Errored Out")
            })
        }

        if (!fastify.worker) {
            const worker = new Worker(opts.queue, jobProcessor, {
                connection: opts.redis,
                ...opts.worker_options,
                // autorun: false,
            })

            fastify.decorate("worker", worker)

            fastify.worker.on("completed", (job, returnvalue) => {
                fastify.log.info({ job, returnvalue }, "Job Completed")
            })

            fastify.worker.on("failed", (job, error) => {
                fastify.log.error({ job, error }, "Job Failed")
            })

            fastify.worker.on("error", (error) => {
                fastify.log.error({ error }, "Unhandled Exception Thrown by Worker")
                throw new Error(error)
            })

            fastify.worker.on("drained", () => {
                fastify.log.info(`${opts.queue} - is drained, no more jobs left`)
            })

            // fastify.worker.run()

            // no needed to close queue, global
            fastify.addHook("onClose", (fastify, done) => {
                if (fastify.worker === worker) {
                    fastify.worker.close()
                }
            })
        }

        next()
    } catch (err) {
        next(err)
    }
}

export default fp(fastifyBullMQ, {
    name: "bullmq",
})
