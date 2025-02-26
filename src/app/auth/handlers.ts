import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import svc from "@auth/service.js"
import repo from "@auth/repository.js"
import type { ReqOTPBody, ResetPassword, UserLogin, VerifyEmail } from "@auth/schemas.js"

/**
 * * POST /v1/auth/login
 */
const login = async function (req: FastifyRequest<{ Body: UserLogin }>, reply: FastifyReply) {
    await svc.verifyCaptcha(this, req.body.captchaToken)

    const token = await svc.authenticate(this, req.body)

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
const register = async function (req: FastifyRequest<{ Body: UserLogin }>, reply: FastifyReply) {
    await svc.verifyCaptcha(this, req.body.captchaToken)

    const token = await svc.registration(this, req.body)

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
const me = async function (req: FastifyRequest, reply: FastifyReply) {
    const data = await repo.getUserById(this, req.user.id)

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

const requestOTP = async function (req: FastifyRequest<{ Body: ReqOTPBody }>, reply: FastifyReply) {
    await svc.verifyCaptcha(this, req.body.captchaToken)

    const email = req.body.email

    await svc.getOTP(this, email)

    reply.code(200)
    return {
        error: false,
        message: `OTP was sent to: ${email}`,
    }
}

/**
 * * POST /v1/auth/verify-email
 */
const verifyEmail = async function (req: FastifyRequest<{ Body: VerifyEmail }>, reply: FastifyReply) {
    await svc.verifyCaptcha(this, req.body.captchaToken)

    const email = req.user.email

    if (req.user.email_verified) {
        throw this.httpErrors.badRequest(`${email} already verified!`)
    }

    const check = await svc.verifyOTP(this, { code: req.body.code, email })

    if (!check) {
        throw this.httpErrors.badRequest("OTP incorrect or expired")
    }

    const token = await svc.verifyUserEmail(this, email)

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
const resetPassword = async function (req: FastifyRequest<{ Body: ResetPassword }>, reply: FastifyReply) {
    await svc.verifyCaptcha(this, req.body.captchaToken)

    const { email, code } = req.body

    const check = await svc.verifyOTP(this, { code, email })

    if (!check) {
        throw this.httpErrors.badRequest("OTP incorrect or expired")
    }

    await svc.updateUserPassword(this, req.body)

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
