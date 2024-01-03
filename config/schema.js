const S = require('fluent-json-schema')

const responseObject = data =>
    S.object()
        .prop('error', S.boolean().required())
        .prop('message', S.string().required())
        .prop('data', data)

const responseListObject = data =>
    S.object()
        .prop('error', S.boolean().required())
        .prop('message', S.string().required())
        .prop('data', S.array().items(data).required())

const userObject = S.object()
    .prop('id', S.number())
    .prop('email', S.string())
    .prop('email_verified', S.boolean())
    .prop('role', S.enum(['customer', 'admin', 'manager']))
    .prop('is_banned', S.boolean())
    .prop('created_at', S.string().format('date'))
    .prop('updated_at', S.string().format('date'))

const emailPassObj = S.object()
    .prop(
        'email',
        S.string().minLength(6).maxLength(100).format('email').required()
    )
    .prop('password', S.string().required())

const s_flush = {
    response: { 200: responseObject() }
}

const s_paginate = row_data =>
    responseObject(
        S.object()
            .prop('total', S.number())
            .prop('per_page', S.number())
            .prop('offset', S.number())
            .prop('to', S.number())
            .prop('last_page', S.number())
            .prop('current_page', S.number())
            .prop('from', S.number())
            .prop('data', S.array().items(row_data))
    )

module.exports = {
    responseObject,
    responseListObject,
    userObject,
    emailPassObj,
    s_paginate,
    s_flush
}
