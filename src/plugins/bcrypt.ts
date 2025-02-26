import bcrypt from "bcryptjs"

import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

function fastifyBcrypt(fastify: FastifyInstance, opts: { saltWorkFactor: number }, done: () => void) {
    const saltWorkFactor = opts.saltWorkFactor || 10

    const hash = async (pwd: string) => await bcrypt.hash(pwd, saltWorkFactor)

    const compare = async (claim1: string, claim2: string) => await bcrypt.compare(claim1, claim2)

    fastify.decorate("bcrypt", {
        hash,
        compare,
    })

    done()
}

declare module "fastify" {
    interface FastifyInstance {
        bcrypt: {
            hash: (pwd: string) => Promise<string>
            compare: (claim1: string, claim2: string) => Promise<boolean>
        }
    }
}

export default fp(fastifyBcrypt, {
    fastify: ">=5.0.0",
    name: "bcrypt",
})
