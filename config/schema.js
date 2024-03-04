import { S } from "fluent-json-schema"

export const responseObject = (data) =>
    S.object().prop("error", S.boolean().required()).prop("message", S.string().required()).prop("data", data)

export const responseListObject = (data) =>
    S.object()
        .prop("error", S.boolean().required())
        .prop("message", S.string().required())
        .prop("data", S.array().items(data).required())

export const userObject = S.object()
    .prop("id", S.number())
    .prop("email", S.string())
    .prop("email_verified", S.boolean())
    .prop("role", S.enum(["customer", "admin", "manager"]))
    .prop("is_banned", S.boolean())
    .prop("created_at", S.string().format("date"))
    .prop("updated_at", S.string().format("date"))

export const emailPassObj = S.object()
    .prop("email", S.string().minLength(6).maxLength(100).format("email").required())
    .prop("password", S.string().required())

export const s_flush = {
    response: { 200: responseObject() },
}

export const s_paginate = (row_data) =>
    responseObject(
        S.object()
            .prop("total", S.number())
            .prop("per_page", S.number())
            .prop("offset", S.number())
            .prop("to", S.number())
            .prop("last_page", S.number())
            .prop("current_page", S.number())
            .prop("from", S.number())
            .prop("data", S.array().items(row_data)),
    )
