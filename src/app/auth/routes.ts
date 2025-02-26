import type { FastifyInstance, RouteOptions } from "fastify"
import bcrypt from "../../plugins/bcrypt.js"

import auth from "./handlers.js"

import s from "./schemas.js"

function routes(app: FastifyInstance, opts: RouteOptions, done: () => void) {
    app.register(bcrypt, { saltWorkFactor: 10 })

    app.route({
        method: "POST",
        url: "/register",
        schema: s.registerSchema,
        handler: auth.register,
    })

    app.route({
        method: "POST",
        url: "/login",
        schema: s.loginSchema,
        handler: auth.login,
    })

    app.route({
        method: "GET",
        url: "/me",
        onRequest: app.authenticate,
        schema: s.meSchema,
        handler: auth.me,
    })

    app.route({
        method: "POST",
        url: "/otp-code",
        schema: s.requestOTPSchema,
        handler: auth.requestOTP,
    })

    app.route({
        method: "POST",
        url: "/verify-email",
        onRequest: app.authenticate,
        schema: s.verifyEmailSchema,
        handler: auth.verifyEmail,
    })

    app.route({
        method: "POST",
        url: "/reset-password",
        schema: s.resetPasswordSchema,
        handler: auth.resetPassword,
    })
}

export default routes
