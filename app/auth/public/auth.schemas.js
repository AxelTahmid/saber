import { S } from "fluent-json-schema"

import { emailPassObj, responseListObject, responseObject, userObject } from "../../../config/schema.js"

/**
 * * POST /v1/auth/login
 */
export const loginSchema = {
    body: emailPassObj,
    response: { 200: responseObject() },
}
/**
 * * POST /v1/auth/register
 */
export const registerSchema = {
    body: emailPassObj,
    response: { 201: responseObject() },
}
/**
 * * GET /v1/auth/me
 */
export const meSchema = {
    response: {
        200: responseObject(userObject),
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
        200: responseObject(),
    },
}
/**
 * * POST /v1/auth/verify-email
 */
export const verifyEmailSchema = {
    body: S.object()
        .prop("code", S.string().minLength(5).maxLength(6).required())
        .prop("captchaToken", S.string().minLength(1).required()),
    response: { 201: responseObject(S.object().prop("token", S.string())) },
}
/**
 * * POST /v1/auth/reset-password
 */
export const resetPassBody = S.object()
    .prop("email", S.string().minLength(6).maxLength(100).format("email").required())
    .prop("password", S.string().required())
    .prop("code", S.string().minLength(5).maxLength(6).required())
    .prop("captchaToken", S.string().minLength(1).required())

export const resetPasswordSchema = {
    body: resetPassBody,
    response: { 201: responseObject(S.object().prop("token", S.string())) },
}

export default {
    loginSchema,
    registerSchema,
    meSchema,
    requestOTPSchema,
    verifyEmailSchema,
    resetPasswordSchema,
}
