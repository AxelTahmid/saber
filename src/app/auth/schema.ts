import type { FastifySchema } from "fastify"

import { type Static, Type } from "@sinclair/typebox"
import { replyObj } from "../../config/schema.js"

export const userBody = Type.Object({
    id: Type.Number(),
    email: Type.String(),
    email_verified: Type.Boolean(),
    role: Type.Union([Type.Literal("customer"), Type.Literal("admin"), Type.Literal("manager")]),
    created_at: Type.String({ format: "date" }),
    updated_at: Type.String({ format: "date" }),
})
export type User = Static<typeof userBody>

export const userLoginBody = Type.Object({
    email: Type.String({ minLength: 6, maxLength: 100, format: "email" }),
    password: Type.String(),
    captchaToken: Type.String({ minLength: 1 }),
})
export type UserLogin = Static<typeof userLoginBody>

export const resetPasswordBody = Type.Object({
    email: Type.String({ minLength: 6, maxLength: 100, format: "email" }),
    password: Type.String(),
    code: Type.String({ minLength: 5, maxLength: 6 }),
    captchaToken: Type.String({ minLength: 1 }),
})
export type ResetPassword = Static<typeof resetPasswordBody>

export const verifyEmailBody = Type.Object({
    code: Type.String({ minLength: 5, maxLength: 6 }),
    captchaToken: Type.String({ minLength: 1 }),
})
export type VerifyEmail = Static<typeof verifyEmailBody>

export const reqOTPBody = Type.Object({
    email: Type.String({ minLength: 6, maxLength: 100, format: "email" }),
    captchaToken: Type.String({ minLength: 1 }),
})
export type ReqOTPBody = Static<typeof reqOTPBody>

export const tokenBody = Type.Object({
    token: Type.String(),
})
export type TokenBody = Static<typeof tokenBody>

/**
 * * POST /v1/auth/login
 */
const loginSchema: FastifySchema = {
    body: userLoginBody,
    response: { 200: replyObj(null) },
}
/**
 * * POST /v1/auth/register
 */
const registerSchema: FastifySchema = {
    body: userLoginBody,
    response: { 201: replyObj(null) },
}
/**
 * * GET /v1/auth/me
 */
const meSchema: FastifySchema = {
    response: { 200: replyObj(userBody) },
}
/**
 * * GET /v1/auth/me
 */
const requestOTPSchema: FastifySchema = {
    body: reqOTPBody,
    response: { 200: replyObj(null) },
}
/**
 * * POST /v1/auth/verify-email
 */
const verifyEmailSchema: FastifySchema = {
    body: verifyEmailBody,
    response: { 201: replyObj(tokenBody) },
}
/**
 * * POST /v1/auth/reset-password
 */
const resetPasswordSchema: FastifySchema = {
    body: resetPasswordBody,
    response: { 201: replyObj(tokenBody) },
}

export default {
    loginSchema,
    registerSchema,
    meSchema,
    requestOTPSchema,
    verifyEmailSchema,
    resetPasswordSchema,
}
