import {
    createAdmin,
    fetchAdmin,
    updateAdmin,
    authenticate
} from './auth.services.js'

/**
 * * POST /v1/admin/auth/login
 */
export const login = async function (request, reply) {
    const token = await authenticate(this, request.body)

    reply.code(200)
    return {
        error: false,
        message: 'Login Sucessful',
        data: { token }
    }
}

/**
 * * POST /v1/admin/auth/register
 */
export const create = async function (request, reply) {
    await createAdmin(this, request.body)

    reply.code(201)
    return {
        error: false,
        message: 'Registration Sucessful'
    }
}

/**
 * * GET /v1/admin/auth/me
 */
export const fetch = async function (request, reply) {
    const data = await fetchAdmin(this, request.user.email)

    reply.code(200)
    return {
        error: false,
        message: 'User Fetched!',
        data
    }
}

/**
 * * POST /v1/admin/auth/
 */
export const update = async function (request, reply) {
    await updateAdmin(this, request.body)

    reply.code(201)

    return {
        error: false,
        message: 'User Updated'
    }
}

export default { login, create, update, fetch }
