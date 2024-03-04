/* eslint-disable no-param-reassign, max-len */
import fp from "fastify-plugin"
import { createTransport } from "nodemailer"

function fastifyMailer(fastify, options, next) {
    const { defaults, namespace, transport } = options

    if (!transport) {
        return next(
            new Error(
                "You must provide a valid transport configuration object, connection url or a transport plugin instance",
            ),
        )
    }

    let transporter

    try {
        if (!defaults) {
            transporter = createTransport(transport)
        } else {
            transporter = createTransport(transport, defaults)
        }
    } catch (error) {
        return next(error)
    }

    if (namespace) {
        if (transporter[namespace]) {
            return next(new Error(`@fastify/nodemailer '${namespace}' is a reserved keyword`))
        } else if (!fastify.mailer) {
            fastify.decorate("mailer", Object.create(null)).addHook("onClose", (fastify, done) => {
                fastify.mailer.close(done)
            })
        } else if (Object.prototype.hasOwnProperty.call(fastify.mailer, namespace)) {
            return next(new Error(`@fastify/nodemailer '${namespace}' instance name has already been registered`))
        }

        fastify.mailer[namespace] = transporter
    } else {
        if (fastify.mailer) {
            return next(new Error("@fastify/nodemailer has already been registered"))
        } else {
            fastify.decorate("mailer", transporter).addHook("onClose", (fastify, done) => {
                fastify.mailer.close(done)
            })
        }
    }

    next()
}

export default fp(fastifyMailer, {
    fastify: ">=4.0.0",
    name: "@fastify/nodemailer",
})
