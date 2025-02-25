import * as bcrypt from "bcryptjs"
import fp from "fastify-plugin"

function fastifyBcrypt(fastify, opts, done) {
    const saltWorkFactor = opts.saltWorkFactor || 10

    const hash = async (pwd) => bcrypt.hash(pwd, saltWorkFactor)

    const compare = async (claim1, claim2) => bcrypt.compare(claim1, claim2)

    fastify
        .decorate("bcrypt", {
            hash,
            compare,
        })
        .decorateRequest("bcryptHash", hash)
        .decorateRequest("bcryptCompare", compare)

    done()
}

export default fp(fastifyBcrypt, {
    name: "bcrypt",
})
