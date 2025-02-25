import bcrypt from "../../plugins/bcrypt.js"

import auth from "./handlers.js"

import s from "./schemas.js"

export default function routes(app) {
    app.register(bcrypt)

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
