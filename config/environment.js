import "dotenv/config"
import { Redis } from "ioredis"

export default {
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT || 3000,
    isDevEnvironment: process.env.NODE_ENV === "development",
    captcha: {
        secret: process.env.TURNSTILE_SECRET_KEY,
    },
    cors: {
        origin: [/https?:\/\/[^/]*\.<domain>\.com(:\d{1,5})?/],
        method: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Access-Control-Allow-Origin",
            "Origin",
            "User-Agent",
            "X-Requested-With",
            "If-Modified-Since",
            "Cache-Control",
            "Range",
        ],
        credentials: true,
    },
    sql: {
        client: "pg",
        searchPath: ["knex", "public"],
        acquireConnectionTimeout: 10000,
        connection: process.env.PG_CONNECTION_STRING,
        pool: {
            min: 1,
            max: 10,
        },
    },
    storage: {
        multer: {
            fieldNameSize: 100, // Max field name size in bytes
            fieldSize: 100, // Max field value size in bytes
            fields: 2, // Max number of non-file fields
            fileSize: 1000000, // the max file size in bytes, 1MB
            files: 1, // Max number of file fields
        },
        connection: {
            forcePathStyle: true,
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_PASSWORD,
            },
        },
        bucket: process.env.S3_BUCKET,
    },
    redis: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_PORT,
    },
    healthcheck: {
        maxEventLoopDelay: 1000,
        maxEventLoopUtilization: 0.9,
        message: "Server under pressure!",
        retryAfter: 60,
        exposeStatusRoute: {
            routeResponseSchemaOpts: {
                metrics: {
                    type: "object",
                    properties: {
                        eventLoopDelay: { type: "number" },
                        eventLoopUtilized: { type: "number" },
                        rssBytes: { type: "number" },
                        heapUsed: { type: "number" },
                    },
                },
            },
        },
        healthCheck: async (app) => {
            return {
                metrics: app.memoryUsage(),
            }
        },
    },
    mailer: {
        defaults: {
            from: process.env.MAILER_DEFAULT_FROM || "domainName <email>",
            subject: "No-Reply domainName",
        },
        transport: {
            service: "gmail",
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASSWORD,
            },
        },
    },
    bullMQ: {
        redis: new Redis({
            host: process.env.REDIS_URL || "127.0.0.1",
            port: process.env.REDIS_PORT || 6379,
            maxRetriesPerRequest: null,
        }),
        job_options: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
        worker_options: {
            concurrency: parseInt(process.env.QUEUE_CONCURRENCY, 10) || 10,
            limiter: {
                max: parseInt(process.env.QUEUE_GLOBAL_CONCURRENCY, 10) || 60,
                duration: parseInt(process.env.QUEUE_LIMIT_DURATION, 10) || 1000,
            },
        },
        queue: process.env.QUEUE_NAME || "mail-queue",
    },
    rate_limit: {
        redis: new Redis({
            host: process.env.REDIS_URL,
            port: process.env.REDIS_PORT,
            connectTimeout: 500,
            maxRetriesPerRequest: 1,
        }),
        max: 60,
        timeWindow: 1000 * 60,
        nameSpace: "limit:",
        keyGenerator: (req) => {
            const key = req.headers["x-forwarded-for"] || req.raw.ip
            return `${key}:${req.routeOptions.url}`
        },
    },
}
