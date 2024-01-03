const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const fp = require('fastify-plugin')
const { default: fastifyJwt } = require('@fastify/jwt')
const {
    authenticated,
    verified,
    admin,
    manager,
    restricted
} = require('../utility/jwt')

/**
 * * All JWT features including roles
 */
const fastJWT = async function (fastify) {
    /**
     * * prime256v1, in short P-256 ECDSA keys for JWT
     */
    fastify.register(fastifyJwt, {
        secret: {
            private: readFileSync(
                `${join(__dirname, '..', 'certs')}/private.pem`
            ),
            public: readFileSync(`${join(__dirname, '..', 'certs')}/public.pem`)
        },
        sign: { algorithm: 'ES256' }
    })

    /**
     * * generate token for authorization
     */
    const token = async function (user) {
        return await fastify.jwt.sign(
            {
                id: user.id,
                email: user.email,
                email_verified: Boolean(user.email_verified),
                is_banned: Boolean(user.is_banned),
                role: user.role
            },
            { expiresIn: '1d' }
        )
    }

    fastify.decorate('authenticate', authenticated)

    fastify.decorate('auth', {
        token,
        verified
    })

    fastify.decorate('role', {
        admin,
        manager,
        restricted
    })
}
module.exports = fp(fastJWT)
