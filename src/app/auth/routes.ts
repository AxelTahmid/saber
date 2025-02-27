import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify"
import bcrypt from "../../plugins/bcrypt.js"

import auth from "./handler.js"

import schema from "./schema.js"

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
    app.register(bcrypt, { saltWorkFactor: 10 })

    app.route({
        method: "POST",
        url: "/register",
        schema: schema.registerSchema,
        handler: auth.register,
    })

    app.route({
        method: "POST",
        url: "/login",
        schema: schema.loginSchema,
        handler: auth.login,
    })

    app.route({
        method: "GET",
        url: "/me",
        onRequest: app.authenticate,
        schema: schema.meSchema,
        handler: auth.me,
    })

    app.route({
        method: "POST",
        url: "/otp-code",
        schema: schema.requestOTPSchema,
        handler: auth.requestOTP,
    })

    app.route({
        method: "POST",
        url: "/verify-email",
        onRequest: app.authenticate,
        schema: schema.verifyEmailSchema,
        handler: auth.verifyEmail,
    })

    app.route({
        method: "POST",
        url: "/reset-password",
        schema: schema.resetPasswordSchema,
        handler: auth.resetPassword,
    })
}

export default routes
