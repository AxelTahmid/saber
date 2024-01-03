const bcrypt = require('../../../plugins/bcrypt')

const { login, fetch, create, update } = require('./auth.handlers')
const { login_s, fetch_s, create_s, update_s } = require('./auth.schemas')

module.exports = async function (fastify) {
    fastify.register(bcrypt)

    fastify.route({
        method: 'POST',
        url: '/login',
        schema: login_s,
        handler: login
    })

    fastify.route({
        method: 'POST',
        url: '/register',
        schema: create_s,
        handler: create
    })

    fastify.route({
        method: 'PUT',
        url: '/modify',
        onRequest: fastify.role.restricted,
        schema: update_s,
        handler: update
    })

    fastify.route({
        method: 'GET',
        url: '/me',
        onRequest: fastify.role.restricted,
        schema: fetch_s,
        handler: fetch
    })
}
