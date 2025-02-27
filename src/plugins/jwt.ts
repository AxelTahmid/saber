import fastifyJwt from "@fastify/jwt"
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

type User = {
    id: number
    email: string
    email_verified: boolean
    role: string
    is_banned?: boolean
}

enum Roles {
    ADMIN = "admin",
    MANAGER = "manager",
    CUSTOMER = "customer",
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * * All JWT features including roles
 */
async function fastJWT(app: FastifyInstance) {
    /**
     * * prime256v1, in short P-256 ECDSA keys for JWT
     */
    app.register(fastifyJwt, {
        secret: {
            private: readFileSync(join(__dirname, "..", "..", "certs", "private.pem")),
            public: readFileSync(join(__dirname, "..", "..", "certs", "public.pem")),
        },
        sign: { algorithm: "ES256" },
    })

    /**
     * * generate token for authorization
     */
    const token = async (user: User) =>
        app.jwt.sign(
            {
                id: user.id,
                email: user.email,
                email_verified: Boolean(user.email_verified),
                role: user.role,
            },
            { expiresIn: "1d" },
        )

    app.decorate("authenticate", authenticated)

    app.decorate("auth", {
        token,
        verified,
    })

    app.decorate("role", {
        admin,
        manager,
        restricted,
    })
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: User
        user: User
    }
}

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
        auth: {
            token: (user: User) => Promise<string>
            verified: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
        }
        role: {
            admin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
            manager: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
            restricted: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
        }
    }
}

/**
 * * email verified middleware.
 * * for ordering and profile operations
 */
const verified = async (req: FastifyRequest, reply: FastifyReply) => {
    await req.jwtVerify()
    if (req.user.email_verified === false) {
        reply.code(403)
        throw Error(`User: ${req.user.email} is not verified`)
    }
}
/**
 * * check if logged in
 */
const authenticated = async (req: FastifyRequest, reply: FastifyReply) => {
    await req.jwtVerify()
    if (req.user.is_banned) {
        reply.code(403)
        throw Error(`${req.user.email} is banned.`)
    }
}
/**
 * *  admin role check
 */
const admin = async (req: FastifyRequest, reply: FastifyReply) => {
    await req.jwtVerify()
    if (req.user.role !== Roles.ADMIN) {
        reply.code(401)
        throw Error(`${req.user.email} does not have permission`)
    }
}
/**
 * * manager role check
 */
const manager = async (req: FastifyRequest, reply: FastifyReply) => {
    await req.jwtVerify()
    if (req.user.role !== Roles.MANAGER) {
        reply.code(401)
        throw Error(`${req.user.email} does not have permission`)
    }
}
/**
 * * Blocks Customer
 * * Allows User with admin or manager role
 */
const restricted = async (req: FastifyRequest, reply: FastifyReply) => {
    await req.jwtVerify()
    if (req.user.role === Roles.ADMIN || req.user.role === Roles.MANAGER) {
        reply.code(401)
        throw Error(`${req.user.email} does not have permission`)
    }
}

export default fp(fastJWT, {
    fastify: ">=5.0.0",
    name: "fast-jwt",
})
