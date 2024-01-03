import helper from './handlers'
import schema from './schema'

export default async function (fastify) {
    fastify.route({
        method: 'GET',
        url: '/',
        schema: schema.base,
        handler: helper.base
    })

    fastify.route({
        method: 'POST',
        url: '/otp',
        onRequest: fastify.role.restricted,
        schema: schema.arrayofString,
        handler: helper.otpKeys
    })

    fastify.route({
        method: 'POST',
        url: '/redis',
        onRequest: fastify.role.restricted,
        handler: helper.redisData
    })

    fastify.route({
        method: 'POST',
        url: '/queue',
        onRequest: fastify.role.restricted,
        schema: schema.queueAction,
        handler: helper.queueAction
    })

    fastify.route({
        method: 'POST',
        url: '/flush',
        onRequest: fastify.role.restricted,
        handler: helper.flushRedis
    })
}
