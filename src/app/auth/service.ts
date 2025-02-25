// authService.js
import { ofetch } from "ofetch"
import conf from "../../config/environment.js"
import repo from "./repository.js"

class AuthService {
    async verifyCaptcha(app, token) {
        if (conf.isDevEnvironment) {
            return true
        }

        if (!conf.captcha?.secret) {
            throw app.httpErrors.badRequest("Captcha failed, config not set!")
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
            throw app.httpErrors.badRequest(`Captcha Failed: ${data["error-codes"][0]}`)
        }
        return true
    }

    async authenticate(app, params) {
        const { email, password } = params || {}
        const key = `timeout:${email}`
        let attempt = await app.cache.get(key)
        if (attempt >= 5) {
            throw app.httpErrors.forbidden("5 Wrong Attempts! Try again in 5 minutes.")
        }

        const user = await repo.getUserByEmail(app, email)
        if (!user) throw app.httpErrors.notFound(`User: ${email}, not found!`)

        const match = await app.bcrypt.compare(password, user.password)
        if (!match) {
            attempt = (attempt || 0) + 1
            await app.redis.setex(key, 300, attempt.toString())
            throw app.httpErrors.forbidden("Password Incorrect!")
        }
        return await app.auth.token(user)
    }

    async registration(app, params) {
        const { email, password } = params || {}
        const hashedPassword = await app.bcrypt.hash(password)
        const userId = await repo.createUser(app, { email, password: hashedPassword })
        const user = {
            id: userId,
            email,
            email_verified: false,
        }
        return await app.auth.token(user)
    }

    async verifyUserEmail(app, email) {
        const updatedUser = await repo.updateUserEmailVerified(app, email)
        return await app.auth.token({
            ...updatedUser,
            email_verified: true,
            role: "customer",
        })
    }

    async updateUserPassword(app, params) {
        const { email, password } = params || {}
        const hashedPassword = await app.bcrypt.hash(password)
        await repo.updateUserPassword(app, { email, password: hashedPassword })
    }

    async getOTP(app, email) {
        const user = await repo.getUserByEmail(app, email)
        if (!user) throw app.httpErrors.notFound("User not found!")

        const otp_code = Math.random().toString().substring(2, 8)
        await app.redis.setex(`otp:${email}`, 1800, otp_code)
        app.log.info({ otp_code }, "otp here: ")
        app.queue.add(`otp-${email}`, {
            action: "otp",
            payload: { email, otp_code },
        })
        return otp_code
    }

    async verifyOTP(app, params) {
        const key = `otp:${params.email}`
        const otp = await app.redis.get(key)
        if (otp && otp === params.code) {
            await app.redis.del(key)
            return true
        }
        return false
    }
}

export default new AuthService()
