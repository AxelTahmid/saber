import type { FastifyInstance } from "fastify"
import { ofetch } from "ofetch"

import conf from "../../config/environment.js"
import type AuthRepository from "./repository.js"
import type { ResetPassword, User, UserLogin } from "./types.js"

class AuthService {
    private app: FastifyInstance
    private repo: AuthRepository

    constructor(app: FastifyInstance, repo: AuthRepository) {
        this.app = app
        this.repo = repo
    }

    public async verifyCaptcha(token: string) {
        if (conf.isDevEnvironment) {
            return true
        }

        if (!conf.captcha?.secret) {
            throw this.app.httpErrors.badRequest("Captcha failed, config not set!")
        }

        const data = await ofetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: {
                secret: conf.captcha.secret,
                response: token,
            },
            timeout: 2000,
        })

        if (!data.success) {
            throw this.app.httpErrors.badRequest(`Captcha Failed: ${data["error-codes"][0]}`)
        }
        return true
    }

    public async authenticate(params: UserLogin) {
        const { email, password } = params || {}
        const key = `timeout:${email}`
        let attempt = await this.app.cache.get(key)
        if (attempt >= 5) {
            throw this.app.httpErrors.forbidden("5 Wrong Attempts! Try again in 5 minutes.")
        }

        const user = await this.repo.getUserByEmail(email)
        if (!user) throw this.app.httpErrors.notFound(`User: ${email}, not found!`)

        const match = await this.app.bcrypt.compare(password, user.password)
        if (!match) {
            attempt = (attempt || 0) + 1
            await this.app.redis.setex(key, 300, attempt.toString())
            throw this.app.httpErrors.forbidden("Password Incorrect!")
        }
        return await this.app.auth.token(user)
    }

    public async registration(params: UserLogin) {
        const { email, password } = params || {}
        const hashedPassword = await this.app.bcrypt.hash(password)
        const userId = await this.repo.createUser({ email, password: hashedPassword })
        const user = {
            id: userId,
            email,
            email_verified: false,
        }
        return await this.app.auth.token(user as User)
    }

    public async verifyUserEmail(email: string) {
        const updatedUser = await this.repo.updateUserEmailVerified(email)
        return await this.app.auth.token({
            ...updatedUser,
            email_verified: true,
            role: "customer",
        } as User)
    }

    public async updateUserPassword(params: ResetPassword) {
        const { email, password } = params || {}
        const hashedPassword = await this.app.bcrypt.hash(password)
        await this.repo.updateUserPassword({ email, password: hashedPassword })
    }

    public async getOTP(email: string) {
        const user = await this.repo.getUserByEmail(email)
        if (!user) throw this.app.httpErrors.notFound("User not found!")

        const otp_code = Math.random().toString().substring(2, 8)
        await this.app.redis.setex(`otp:${email}`, 1800, otp_code)
        this.app.log.info({ otp_code }, "otp here: ")
        this.app.queue?.add(`otp-${email}`, {
            action: "otp",
            payload: { email, otp_code },
        })
        return otp_code
    }

    public async verifyOTP(params: { code: string; email: string }) {
        const key = `otp:${params.email}`
        const otp = await this.app.redis.get(key)
        if (otp && otp === params.code) {
            await this.app.redis.del(key)
            return true
        }
        return false
    }
}

export default AuthService
