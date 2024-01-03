const fp = require('fastify-plugin')
const knex = require('knex')
const paginator = require('../utility/knex')

const fastifyKnex = async function (fastify, options, next) {
    try {
        if (!fastify.knex) {
            const handler = knex(options)

            fastify.decorate('knex', handler)

            fastify.addHook('onClose', (fastify, done) => {
                if (fastify.knex === handler) {
                    fastify.knex.destroy(done)
                }
            })
        }

        fastify.decorate('paginate_data', paginator(fastify.knex))

        next()
    } catch (err) {
        next(err)
    }
}

module.exports = fp(fastifyKnex, {
    name: 'fastify-knex'
})
