const S = require('fluent-json-schema')
const {
    emailPassObj,
    userObject,
    responseObject,
    responseListObject
} = require('../../../config/schema')

const keysObj = S.object()
    .prop('item_id', S.number())
    .prop('item_form', S.mixed([S.TYPES.STRING, S.TYPES.NULL]))
    .prop('product_slug', S.string())
    .prop('product_name', S.string())
    .prop('product_photo', S.mixed([S.TYPES.STRING, S.TYPES.NULL]))
    .prop('license_key', S.string())
    .prop('license_status', S.enum(['active', 'reserved', 'delivered']))

const orderList = S.object()
    .prop('id', S.number())
    .prop('status', S.enum(['pending', 'processing', 'cancelled', 'delivered']))
    .prop('payment_method', S.string())
    .prop('account_number', S.string())
    .prop('transaction_id', S.string())
    .prop('order_total', S.number())
    .prop('created_at', S.string().format('date'))
    .prop('order_items', S.array().items(keysObj))
/**
 * * POST /v1/auth/login
 */
const loginSchema = {
    body: emailPassObj,
    response: { 200: responseObject() }
}
/**
 * * POST /v1/auth/register
 */
const registerSchema = {
    body: emailPassObj,
    response: { 201: responseObject() }
}
/**
 * * GET /v1/auth/me
 */
const meSchema = {
    response: {
        200: responseObject(userObject)
    }
}
/**
 * * GET /v1/auth/me
 */
const requestOTPSchema = {
    body: S.object()
        .prop(
            'email',
            S.string().minLength(6).maxLength(100).format('email').required()
        )
        .prop('captchaToken', S.string().minLength(1).required()),

    response: {
        200: responseObject()
    }
}
/**
 * * POST /v1/auth/verify-email
 */
const verifyEmailSchema = {
    body: S.object()
        .prop('code', S.string().minLength(5).maxLength(6).required())
        .prop('captchaToken', S.string().minLength(1).required()),
    response: { 201: responseObject(S.object().prop('token', S.string())) }
}
/**
 * * POST /v1/auth/reset-password
 */
const resetPassBody = S.object()
    .prop(
        'email',
        S.string().minLength(6).maxLength(100).format('email').required()
    )
    .prop('password', S.string().required())
    .prop('code', S.string().minLength(5).maxLength(6).required())
    .prop('captchaToken', S.string().minLength(1).required())

const resetPasswordSchema = {
    body: resetPassBody,
    response: { 201: responseObject(S.object().prop('token', S.string())) }
}

module.exports = {
    loginSchema,
    registerSchema,
    meSchema,
    requestOTPSchema,
    verifyEmailSchema,
    resetPasswordSchema
}
