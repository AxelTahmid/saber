import { Type } from "@sinclair/typebox"
import type { FastifySchema } from "fastify"
import { replyObj } from "../../config/schema.js"

/* ---------------------------------------------
    Reusable Definitions
--------------------------------------------- */
const Email = Type.String({ minLength: 6, maxLength: 100, format: "email" })
const CaptchaToken = Type.String({ minLength: 1 })
const Role = Type.Union([Type.Literal("customer"), Type.Literal("admin"), Type.Literal("manager")])

export namespace Data {
    /* ---------------------------------------------
        Data Schemas
    --------------------------------------------- */
    export const userBody = Type.Object({
        id: Type.Number(),
        email: Email, // original user email schema (less strict)
        email_verified: Type.Boolean(),
        role: Role,
        created_at: Type.String({ format: "date" }),
        updated_at: Type.String({ format: "date" }),
    })
    /* ---------------------------------------------
        Request Body Schemas
    --------------------------------------------- */
    export const userLoginBody = Type.Object({
        email: Email,
        password: Type.String(),
        captchaToken: CaptchaToken,
    })

    export const resetPasswordBody = Type.Object({
        email: Email,
        password: Type.String(),
        code: Type.String({ minLength: 5, maxLength: 6 }),
        captchaToken: CaptchaToken,
    })

    export const verifyEmailBody = Type.Object({
        code: Type.String({ minLength: 5, maxLength: 6 }),
        captchaToken: CaptchaToken,
    })

    export const reqOTPBody = Type.Object({
        email: Email,
        captchaToken: CaptchaToken,
    })

    export const tokenBody = Type.Object({
        token: Type.String(),
    })
}

/* ---------------------------------------------
    Fastify Route Schemas
--------------------------------------------- */
export namespace RouteSchema {
    /**
     * * POST /v1/auth/login
     */
    export const login: FastifySchema = {
        description: "Login existing user",
        tags: ["auth"],
        body: Data.userLoginBody,
        response: { 200: replyObj(null) },
    }

    /**
     * * POST /v1/auth/register
     */
    export const register: FastifySchema = {
        description: "Register new user",
        tags: ["auth"],
        body: Data.userLoginBody,
        response: { 201: replyObj(null) },
    }

    /**
     * * GET /v1/auth/me
     */
    export const me: FastifySchema = {
        description: "Fetch user information",
        tags: ["auth"],
        response: { 200: replyObj(Data.userBody) },
    }

    /**
     * * POST /v1/auth/otp-code
     */
    export const requestOTP: FastifySchema = {
        description: "Request One Time Password (OTP) for user",
        tags: ["auth"],
        body: Data.reqOTPBody,
        response: { 200: replyObj(null) },
    }

    /**
     * * POST /v1/auth/verify-email
     */
    export const verifyEmail: FastifySchema = {
        description: "Verify user email",
        tags: ["auth"],
        body: Data.verifyEmailBody,
        response: { 201: replyObj(Data.tokenBody) },
    }

    /**
     * * POST /v1/auth/reset-password
     */
    export const resetPassword: FastifySchema = {
        description: "Reset user password",
        tags: ["auth"],
        body: Data.resetPasswordBody,
        response: { 201: replyObj(Data.tokenBody) },
    }
}
