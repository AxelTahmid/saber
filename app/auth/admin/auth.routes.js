import bcrypt from "../../../plugins/bcrypt.js"

import { create, fetch, login, update } from "./auth.handlers.js"
import { create_s, fetch_s, login_s, update_s } from "./auth.schemas.js"

export default function adminAuth(fastify) {
    fastify.register(bcrypt)

    fastify.route({
        method: "POST",
        url: "/login",
        schema: login_s,
        handler: login,
    })

    fastify.route({
        method: "POST",
        url: "/register",
        schema: create_s,
        handler: create,
    })

    fastify.route({
        method: "PUT",
        url: "/modify",
        onRequest: fastify.role.restricted,
        schema: update_s,
        handler: update,
    })

    fastify.route({
        method: "GET",
        url: "/me",
        onRequest: fastify.role.restricted,
        schema: fetch_s,
        handler: fetch,
    })

    done()
}
