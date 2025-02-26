import { type JSONSchema, S } from "fluent-json-schema"

import { replyObj } from "../../config/schema.js"

export const userObject = S.object()
    .prop("id", S.number())
    .prop("email", S.string())
    .prop("email_verified", S.boolean())
    .prop("role", S.enum(["customer", "admin", "manager"]))
    .prop("created_at", S.string().format("date"))
    .prop("updated_at", S.string().format("date")) satisfies JSONSchema

export const emailPassObj = S.object()
    .prop("email", S.string().minLength(6).maxLength(100).format("email").required())
    .prop("password", S.string().required())

export const resetPassBody = S.object()
    .prop("email", S.string().minLength(6).maxLength(100).format("email").required())
    .prop("password", S.string().required())
    .prop("code", S.string().minLength(5).maxLength(6).required())
    .prop("captchaToken", S.string().minLength(1).required())

/**
 * * POST /v1/auth/login
 */
export const loginSchema = {
    body: emailPassObj,
    response: { 200: replyObj(null) },
}
/**
 * * POST /v1/auth/register
 */
export const registerSchema = {
    body: emailPassObj,
    response: { 201: replyObj(null) },
}
/**
 * * GET /v1/auth/me
 */
export const meSchema = {
    response: {
        200: replyObj(userObject),
    },
}
/**
 * * GET /v1/auth/me
 */
export const requestOTPSchema = {
    body: S.object()
        .prop("email", S.string().minLength(6).maxLength(100).format("email").required())
        .prop("captchaToken", S.string().minLength(1).required()),

    response: {
        200: replyObj(null),
    },
}
/**
 * * POST /v1/auth/verify-email
 */
export const verifyEmailSchema = {
    body: S.object()
        .prop("code", S.string().minLength(5).maxLength(6).required())
        .prop("captchaToken", S.string().minLength(1).required()),
    response: { 201: replyObj(S.object().prop("token", S.string())) },
}
/**
 * * POST /v1/auth/reset-password
 */
export const resetPasswordSchema = {
    body: resetPassBody,
    response: { 201: replyObj(S.object().prop("token", S.string())) },
}

export default {
    loginSchema,
    registerSchema,
    meSchema,
    requestOTPSchema,
    verifyEmailSchema,
    resetPasswordSchema,
}
