import { ofetch } from "ofetch"
import conf from "../../../config/environment.js"

/**
 * Verifies a captcha token using the Cloudflare API.
 * @param {Object} app - The Fastify app object.
 * @param {string} token - The captcha token to verify.
 * @returns {Promise<boolean>} A Promise that resolves to true if the captcha is valid, or false otherwise.
 * @throws {Error} - Throws an error if the captcha config is not set or if the captcha verification fails.
 */
export const verifyCaptcha = async (app, token) => {
    if (conf.isDevEnvironment) {
        return true
    }

    if (!conf.captcha?.secret) {
        throw app.httpErrors.badRequest("Captcha failed, config not set!")
    }

    const data = await ofetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: {
            secret: captcha.secret,
            response: token,
        },
        timeout: 1500,
    })

    if (!data.success) {
        throw app.httpErrors.badRequest(`Captcha Failed: ${data["error-codes"][0]}`)
    }
}
/**
 * Fetches a user by their ID.
 *
 * @param {Object} app - The app instance.
 * @param {number} id - The ID of the user to fetch.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 * @throws {import('http-errors').HttpError} Throws a 404 error if the user is not found.
 */
export const fetchUser = async (app, id) => {
    const user = await app.knex("user_customers").where("id", id).first()

    if (!user) throw app.httpErrors.notFound("User not found!")

    return user
}
/**
 * Authenticates a user with the provided email and password.
 * @param {Object} app - The app instance.
 * @param {Object} props - The properties object containing the email and password.
 * @param {string} props.email - The email of the user to authenticate.
 * @param {string} props.password - The password of the user to authenticate.
 * @returns {Promise<string>} - A promise that resolves with the authentication token.
 * @throws {ForbiddenError} - If there have been 5 or more failed attempts to authenticate within the last 5 minutes.
 * @throws {NotFoundError} - If no user with the provided email is found.
 * @throws {ForbiddenError} - If the provided password is incorrect.
 */
export const authenticate = async (app, props) => {
    const { email, password } = props || {}
    const key = `timeout:${email}`
    let count = await app.cache.get(key)
    if (count >= 5) {
        throw app.httpErrors.forbidden("5 Wrong Attempts! Try again in 5 minutes.")
    }

    const user = await app.knex("user_customers").where("email", email).first()

    if (!user) throw app.httpErrors.notFound(`User: ${email}, not found!`)

    const match = await app.bcrypt.compare(password, user.password)

    if (!match) {
        count++
        await app.redis.setex(key, 300, count.toString())
        throw app.httpErrors.forbidden("Password Incorrect!")
    }

    return await app.auth.token(user)
}
/**
 * Registers a new user with the provided email and password.
 * @param {object} app - The app instance.
 * @param {object} props - The properties object.
 * @param {string} props.email - The email of the user to register.
 * @param {string} props.password - The password of the user to register.
 * @returns {Promise<string>} - A promise that resolves to the user's authentication token.
 * @throws {Error} - If the user already exists.
 */
export const registration = async (app, props) => {
    let { email, password } = props || {}

    let user = await app.knex("user_customers").where("email", email).first()

    if (user) throw app.httpErrors.badRequest(`User: ${email} already exists! Please Login`)

    password = await app.bcrypt.hash(password)

    const userID = await app.knex("user_customers").insert({ email, password }).returning("id")

    user = {
        id: userID[0].id,
        email,
        email_verified: false,
        is_banned: false,
    }

    return await app.auth.token(user)
}
/**
 * Verify user email and generate a token.
 * @param {Object} app - The app instance.
 * @param {string} email - The email of the user to verify.
 * @returns {Promise<string>} - A Promise that resolves to an string,the generated token.
 * @throws {Error} - If the user is not found.
 */
export const verifyUserEmail = async (app, email) => {
    const isUpdated = await app
        .knex("user_customers")
        .where("email", email)
        .update({ email_verified: true })
        .returning(["id", "email", "is_banned"])

    if (!isUpdated.length) {
        throw app.httpErrors.notFound(`User: ${email}, not found!`)
    }

    return await app.auth.token({
        ...isUpdated[0],
        email_verified: true,
        role: "customer",
    })
}

/**
 * Updates the password of a user with the given email.
 * @param {object} app - The app instance.
 * @param {object} props - The properties object.
 * @param {string} props.email - The email of the user to update.
 * @param {string} props.password - The new password for the user.
 * @throws {Error} If the user is not found.
 * @returns {Promise<void>} A Promise that resolves when the user's password has been updated.
 */
export const updateUserPassword = async (app, props) => {
    const { email, password } = props || {}

    const hashedPassword = await app.bcrypt.hash(password)

    const isUpdated = await app
        .knex("user_customers")
        .where("email", email)
        .update({ password: hashedPassword })
        .returning("id")

    if (!isUpdated.length) {
        throw app.httpErrors.notFound(`User: ${email}, not found!`)
    }
}
/**
 * Generates and sends an OTP code to the user's email.
 * @param {object} app - The application instance.
 * @param {string} email - The email of the user.
 * @throws {NotFoundError} If the user is not found.
 * @returns {Promise<string>} The generated OTP code.
 */
export const getOTP = async (app, email) => {
    const user = await app.knex("user_customers").where("email", email).first()

    if (!user) throw app.httpErrors.notFound("User not found!")

    const otp_code = Math.random().toString().substring(2, 8)

    //* 30 minute expiry
    await app.redis.setex(`otp:${email}`, 1800, otp_code)

    app.log.info({ otp_code }, "otp here: ")

    app.queue.add(`${"otp"}-${email}`, {
        action: "otp",
        payload: {
            email,
            otp_code,
        },
    })

    return otp_code
}
/**
 * Verifies the OTP code for a given email address.
 * @param {Object} app - The application instance.
 * @param {Object} props - The properties object containing the email and code to verify.
 * @param {string} props.email - The email address to verify.
 * @param {string} props.code - The OTP code to verify.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the OTP code is valid, false otherwise.
 */
export const verifyOTP = async (app, props) => {
    const key = `otp:${props.email}`

    const otp = await app.redis.get(key)

    // eslint-disable-next-line eqeqeq
    if (otp && otp == props.code) {
        await app.redis.del(key)
        return true
    } else {
        return false
    }
}
