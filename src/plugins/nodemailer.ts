import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { createTransport, type TransportOptions, type Transporter } from "nodemailer"

// Allow transport to be a config object or connection URL.
// Also, make namespace and defaults optional.
type Opts = {
    transport: string | TransportOptions
    namespace?: string
    defaults?: TransportOptions
}

declare module "fastify" {
    interface FastifyInstance {
        // When registered without a namespace, mailer is a Transporter.
        // When registered with namespaces, mailer is an object mapping string keys to Transporters.
        mailer: Transporter | Record<string, Transporter>
    }
}

function fastifyMailer(fastify: FastifyInstance, options: Opts, next: (err?: Error) => void) {
    const { defaults, namespace, transport } = options

    if (!transport) {
        return next(
            new Error(
                "You must provide a valid transport configuration object, connection url or a transport plugin instance",
            ),
        )
    }

    let transporter: Transporter

    try {
        transporter = !defaults ? createTransport(transport) : createTransport(transport, defaults)
    } catch (error) {
        return next(error as Error)
    }

    if (namespace) {
        // Check if the namespace conflicts with a property on the transporter.
        if (namespace in transporter) {
            return next(new Error(`@fastify/nodemailer '${namespace}' is a reserved keyword`))
        }

        // If no mailer decorator exists, initialize one as an object.
        if (!fastify.hasDecorator("mailer")) {
            fastify.decorate("mailer", {} as Record<string, Transporter>)
            fastify.addHook("onClose", (fastify, done) => {
                const mailers = fastify.mailer as Record<string, Transporter>
                // Iterate over all transporters and close them if possible.
                for (const key in mailers) {
                    if (
                        Object.prototype.hasOwnProperty.call(mailers, key) &&
                        typeof mailers[key].close === "function"
                    ) {
                        mailers[key].close()
                    }
                }
                done()
            })
        } else if (typeof fastify.mailer === "object" && namespace in fastify.mailer) {
            return next(new Error(`@fastify/nodemailer '${namespace}' instance name has already been registered`))
        }

        // Register the transporter under the given namespace.
        ;(fastify.mailer as Record<string, Transporter>)[namespace] = transporter
    } else {
        if (fastify.hasDecorator("mailer")) {
            return next(new Error("@fastify/nodemailer has already been registered"))
        }

        fastify.decorate("mailer", transporter)
        fastify.addHook("onClose", (fastify, done) => {
            const mailer = fastify.mailer as Transporter
            if (typeof mailer.close === "function") {
                mailer.close()
            }
            done()
        })
    }

    next()
}

export default fp(fastifyMailer, {
    fastify: ">=5.0.0",
    name: "nodemailer",
})
