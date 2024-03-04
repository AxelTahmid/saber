import fp from "fastify-plugin"
import knex from "knex"
import paginator from "../utility/knex.js"

async function fastifyKnex(fastify, options, next) {
    try {
        if (!fastify.knex) {
            const handler = knex(options)

            fastify.decorate("knex", handler)

            fastify.addHook("onClose", (fastify, done) => {
                if (fastify.knex === handler) {
                    fastify.knex.destroy(done)
                }
            })
        }

        fastify.decorate("paginate_data", paginator(fastify.knex))

        next()
    } catch (err) {
        next(err)
    }
}

export default fp(fastifyKnex, {
    name: "knex",
})
