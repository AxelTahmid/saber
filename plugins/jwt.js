import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'node:path'

import {
    authenticated,
    verified,
    admin,
    manager,
    restricted
} from '../utility/jwt.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
/**
 * * All JWT features including roles
 */
async function fastJWT(fastify) {
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

export default fp(fastJWT, {
    name: 'fast-jwt'
})
