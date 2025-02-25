import fastifyJwt from "@fastify/jwt"
import fp from "fastify-plugin"

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

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
            private: readFileSync(`${join(__dirname, "..", "certs")}/private.pem`),
            public: readFileSync(`${join(__dirname, "..", "certs")}/public.pem`),
        },
        sign: { algorithm: "ES256" },
    })

    /**
     * * generate token for authorization
     */
    const token = async (user) =>
        await fastify.jwt.sign(
            {
                id: user.id,
                email: user.email,
                email_verified: Boolean(user.email_verified),
                role: user.role,
            },
            { expiresIn: "1d" },
        )

    fastify.decorate("authenticate", authenticated)

    fastify.decorate("auth", {
        token,
        verified,
    })

    fastify.decorate("role", {
        admin,
        manager,
        restricted,
    })
}

/**
 * * email verified middleware.
 * * for ordering and profile operations
 */
const verified = async (request, reply) => {
    await request.jwtVerify()
    if (request.user.email_verified === false) {
        reply.code(403)
        throw Error(`User: ${request.user.email} is not verified`)
    }
}
/**
 * * check if logged in
 */
const authenticated = async (request, reply) => {
    await request.jwtVerify()
    if (request.user.is_banned) {
        reply.code(403)
        throw Error(`${request.user.email} is banned.`)
    }
}
/**
 * *  admin role check
 */
const admin = async (request, reply) => {
    await request.jwtVerify()
    if (request.user.role !== "admin") {
        reply.code(401)
        throw Error(`${request.user.email} does not have permission`)
    }
}
/**
 * * manager role check
 */
const manager = async (request, reply) => {
    await request.jwtVerify()
    if (request.user.role !== "manager") {
        reply.code(401)
        throw Error(`${request.user.email} does not have permission`)
    }
}
/**
 * * Blocks Customer
 * * Allows User with admin or manager role
 */
const restricted = async (request, reply) => {
    await request.jwtVerify()
    const roles = ["admin", "manager"]
    const allowed = roles.includes(request.user.role)
    if (!allowed) {
        reply.code(401)
        throw Error(`${request.user.email} does not have permission`)
    }
}

export default fp(fastJWT, {
    name: "fast-jwt",
})
