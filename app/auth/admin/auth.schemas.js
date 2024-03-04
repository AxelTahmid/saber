import { S } from "fluent-json-schema"
import { responseObject, userObject } from "../../../config/schema.js"

export const adminAuthObj = S.object()
    .prop("email", S.string().minLength(6).maxLength(100).format("email").required())
    .prop("password", S.string().required())
    .prop("role_id", S.number().required())

/**
 * * POST /v1/auth/login
 */
export const login_s = {
    body: adminAuthObj.without(["role_id"]),
    response: { 200: responseObject() },
}
/**
 * * POST /v1/auth/register
 */
export const create_s = {
    body: adminAuthObj,
    response: { 201: responseObject() },
}
/**
 * * GET /v1/auth/me
 */
export const fetch_s = {
    response: {
        200: responseObject(userObject),
    },
}
/**
 * * POST /v1/auth/reset-password
 */
export const update_s = {
    body: adminAuthObj,
    response: { 201: responseObject(S.object().prop("token", S.string())) },
}

export default {
    login_s,
    create_s,
    fetch_s,
    update_s,
}
