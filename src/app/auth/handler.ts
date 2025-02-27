import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import type repo from "@auth/repository.js"
import type svc from "@auth/service.js"
import type { ReqOTPBody, ResetPassword, UserLogin, VerifyEmail } from "./types.js"

class AuthHandler {
    private fastify: FastifyInstance
    private svc: svc
    private repo: repo

    constructor(fastify: FastifyInstance, svcInstance: svc, repoInstance: repo) {
        this.fastify = fastify
        this.svc = svcInstance
        this.repo = repoInstance
    }

    /**
     * * POST /v1/auth/login
     */
    public login = async (req: FastifyRequest<{ Body: UserLogin }>, reply: FastifyReply) => {
        await this.svc.verifyCaptcha(this.fastify, req.body.captchaToken)

        const token = await this.svc.authenticate(this.fastify, req.body)

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
    public register = async (req: FastifyRequest<{ Body: UserLogin }>, reply: FastifyReply) => {
        await this.svc.verifyCaptcha(this.fastify, req.body.captchaToken)

        const token = await this.svc.registration(this.fastify, req.body)

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
    public me = async (req: FastifyRequest, reply: FastifyReply) => {
        const data = await this.repo.getUserById(req.user.id)

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
    public requestOTP = async (req: FastifyRequest<{ Body: ReqOTPBody }>, reply: FastifyReply) => {
        await this.svc.verifyCaptcha(this.fastify, req.body.captchaToken)

        const email = req.body.email

        await this.svc.getOTP(this.fastify, email)

        reply.code(200)
        return {
            error: false,
            message: `OTP was sent to: ${email}`,
        }
    }

    /**
     * * POST /v1/auth/verify-email
     */
    public verifyEmail = async (req: FastifyRequest<{ Body: VerifyEmail }>, reply: FastifyReply) => {
        await this.svc.verifyCaptcha(this.fastify, req.body.captchaToken)

        const email = req.user.email

        if (req.user.email_verified) {
            throw this.fastify.httpErrors.badRequest(`${email} already verified!`)
        }

        const check = await this.svc.verifyOTP(this.fastify, { code: req.body.code, email })

        if (!check) {
            throw this.fastify.httpErrors.badRequest("OTP incorrect or expired")
        }

        const token = await this.svc.verifyUserEmail(this.fastify, email)

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
    public resetPassword = async (req: FastifyRequest<{ Body: ResetPassword }>, reply: FastifyReply) => {
        await this.svc.verifyCaptcha(this.fastify, req.body.captchaToken)

        const { email, code } = req.body

        const check = await this.svc.verifyOTP(this.fastify, { code, email })

        if (!check) {
            throw this.fastify.httpErrors.badRequest("OTP incorrect or expired")
        }

        await this.svc.updateUserPassword(this.fastify, req.body)

        reply.code(201)

        return {
            error: false,
            message: "User Password Changed",
        }
    }
}

export default AuthHandler
