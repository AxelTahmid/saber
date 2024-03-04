import bcrypt from "../../../plugins/bcrypt.js"

import auth from "./auth.handlers.js"

import {
    loginSchema,
    meSchema,
    registerSchema,
    requestOTPSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from "./auth.schemas.js"

export default function publicAuth(fastify, done) {
    fastify.register(bcrypt)

    fastify.route({
        method: "POST",
        url: "/register",
        schema: registerSchema,
        handler: auth.register,
    })

    fastify.route({
        method: "POST",
        url: "/login",
        schema: loginSchema,
        handler: auth.login,
    })

    fastify.route({
        method: "GET",
        url: "/me",
        onRequest: fastify.authenticate,
        schema: meSchema,
        handler: auth.me,
    })

    fastify.route({
        method: "POST",
        url: "/otp-code",
        schema: requestOTPSchema,
        handler: auth.requestOTP,
    })

    fastify.route({
        method: "POST",
        url: "/verify-email",
        onRequest: fastify.authenticate,
        schema: verifyEmailSchema,
        handler: auth.verifyEmail,
    })

    fastify.route({
        method: "POST",
        url: "/reset-password",
        schema: resetPasswordSchema,
        handler: auth.resetPassword,
    })

    done()
}
