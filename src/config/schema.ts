import { Type } from "@sinclair/typebox"

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const replyObj = (data: any) =>
    Type.Object({
        error: Type.Boolean(),
        message: Type.String(),
        data: Type.Optional(data),
    })

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const replyListObj = (data: any) =>
    Type.Object({
        error: Type.Boolean(),
        message: Type.String(),
        data: Type.Array(data),
    })

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const s_paginate = (row_data: any) =>
    replyObj(
        Type.Object({
            total: Type.Optional(Type.Number()),
            per_page: Type.Optional(Type.Number()),
            offset: Type.Optional(Type.Number()),
            to: Type.Optional(Type.Number()),
            last_page: Type.Optional(Type.Number()),
            current_page: Type.Optional(Type.Number()),
            from: Type.Optional(Type.Number()),
            data: Type.Optional(Type.Array(row_data)),
        }),
    )
