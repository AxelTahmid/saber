import {
    authenticate,
    fetchUser,
    getOTP,
    registration,
    updateUserPassword,
    verifyCaptcha,
    verifyOTP,
    verifyUserEmail,
} from "./auth.services.js"

/**
 * * POST /v1/auth/login
 */
const login = async function (request, reply) {
    await verifyCaptcha(this, request.body.captchaToken)

    const token = await authenticate(this, request.body)

    reply.code(200)
    return {
        error: false,
        message: "Login Sucessful",
        data: { token },
    }
}

/**
 * * POST /v1/auth/register
 */
const register = async function (request, reply) {
    await verifyCaptcha(this, request.body.captchaToken)

    const token = await registration(this, request.body)

    reply.code(201)
    return {
        error: false,
        message: "Registration Sucessful",
        data: { token },
    }
}

/**
 * * GET /v1/auth/me
 */
const me = async function (request, reply) {
    const data = await fetchUser(this, request.user.id)

    reply.code(200)
    return {
        error: false,
        message: "User Fetched!",
        data,
    }
}

/**
 * * POST /v1/auth/otp-code
 */

const requestOTP = async function (request, reply) {
    await verifyCaptcha(this, request.body.captchaToken)

    const email = request.body.email

    await getOTP(this, email)

    reply.code(200)
    return {
        error: false,
        message: `OTP was sent to: ${email}`,
    }
}

/**
 * * POST /v1/auth/verify-email
 */
const verifyEmail = async function (request, reply) {
    await verifyCaptcha(this, request.body.captchaToken)

    const email = request.user.email

    if (request.user.email_verified) {
        throw this.httpErrors.badRequest(`${email} already verified!`)
    }

    const check = await verifyOTP(this, { code: request.body.code, email })

    if (!check) {
        throw this.httpErrors.badRequest("OTP incorrect or expired")
    }

    const token = await verifyUserEmail(this, email)

    reply.code(201)

    return {
        error: false,
        message: "User Email Verified",
        data: { token },
    }
}

/**
 * * POST /v1/auth/reset-password
 */
const resetPassword = async function (request, reply) {
    await verifyCaptcha(this, request.body.captchaToken)

    const { email, password, code } = request.body

    const check = await verifyOTP(this, { code, email })

    if (!check) {
        throw this.httpErrors.badRequest("OTP incorrect or expired")
    }
    await updateUserPassword(this, { email, password })

    reply.code(201)

    return {
        error: false,
        message: "User Password Changed",
    }
}

export default {
    login,
    register,
    me,
    requestOTP,
    verifyEmail,
    resetPassword,
}
