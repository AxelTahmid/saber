import { S } from "fluent-json-schema"

export const replyObj = (data) =>
    S.object().prop("error", S.boolean().required()).prop("message", S.string().required()).prop("data", data)

export const replyListObj = (data) =>
    S.object()
        .prop("error", S.boolean().required())
        .prop("message", S.string().required())
        .prop("data", S.array().items(data).required())

export const s_paginate = (row_data) =>
    replyObj(
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
