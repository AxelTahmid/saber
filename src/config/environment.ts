import "dotenv/config"
import type { FastifyInstance } from "fastify"
import { Redis, type RedisOptions } from "ioredis"
import type { Knex } from "knex"
import type { S3ClientConfig } from "@aws-sdk/client-s3"
import type { FastifyCorsOptions } from "@fastify/cors"
import type { FastifyMultipartBaseOptions } from "@fastify/multipart"
import type { FastifyUnderPressureOptions } from "@fastify/under-pressure"
import type { JobsOptions, WorkerOptions } from "bullmq"

/* ----------------------------------------------------------------------------
 * Configuration Interfaces
 * -------------------------------------------------------------------------- */

interface CaptchaConfig {
    secret?: string
}

interface StorageConfig {
    multer: FastifyMultipartBaseOptions
    connection: S3ClientConfig
    bucket?: string
}

interface MailerDefaults {
    from: string
    subject: string
}

interface MailerTransport {
    service: string
    auth: {
        user?: string
        pass?: string
    }
}

interface MailerConfig {
    defaults: MailerDefaults
    transport: MailerTransport
}

interface BullMQConfig {
    redis: RedisOptions
    job_options: JobsOptions
    worker_options: WorkerOptions
    queue: string
}

interface AppConfig {
    host: string
    port: number
    isDevEnvironment: boolean
    captcha: CaptchaConfig
    cors: FastifyCorsOptions
    sql: Knex.Config
    storage: StorageConfig
    redis: RedisOptions
    healthcheck: FastifyUnderPressureOptions
    mailer: MailerConfig
    bullMQ: BullMQConfig
}

/* ----------------------------------------------------------------------------
 * Environment Parsing Helpers
 * -------------------------------------------------------------------------- */

const parseNumber = (value: string | undefined, defaultValue: number): number => (value ? Number(value) : defaultValue)

/* ----------------------------------------------------------------------------
 * Configuration Object
 * -------------------------------------------------------------------------- */

const config: AppConfig = {
    host: process.env.HOST || "0.0.0.0",
    port: parseNumber(process.env.PORT, 3000),
    isDevEnvironment: process.env.NODE_ENV === "development",
    captcha: {
        secret: process.env.TURNSTILE_SECRET_KEY,
    },
    cors: {
        origin: [/https?:\/\/[^/]*\.<domain>\.com(:\d{1,5})?/],
        methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
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
        connection: process.env.DB_URL,
        searchPath: ["knex", "public"],
        acquireConnectionTimeout: 30000, // 30 seconds
        createTimeoutMillis: 5000, // 5 seconds
        idleTimeoutMillis: 30000, // 30 seconds
        reapIntervalMillis: 5000,
        createRetryIntervalMillis: 200, // 0.2 seconds
        propagateCreateError: false,
        pool: {
            min: 1,
            max: 10,
        },
    } as Knex.Config,
    storage: {
        multer: {
            limits: {
                fieldNameSize: 100,
                fieldSize: 100,
                fields: 2,
                fileSize: 1000000,
                files: 1,
            },
        },
        connection: {
            forcePathStyle: true,
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY || "",
                secretAccessKey: process.env.S3_SECRET_PASSWORD || "",
            },
        },
        bucket: process.env.S3_BUCKET,
    },
    redis: {
        host: process.env.REDIS_URL || "127.0.0.1",
        port: parseNumber(process.env.REDIS_PORT, 6379),
    },
    healthcheck: {
        maxEventLoopDelay: 1000,
        maxEventLoopUtilization: 0.9,
        message: "Server under pressure!",
        retryAfter: 60,
        exposeStatusRoute: {
            routeOpts: {},
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
        healthCheck: async (app: FastifyInstance) => ({
            metrics: app.memoryUsage(),
        }),
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
        redis: {
            host: process.env.REDIS_URL || "127.0.0.1",
            port: parseNumber(process.env.REDIS_PORT, 6379),
            maxRetriesPerRequest: null,
        },
        job_options: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
        worker_options: {
            connection: new Redis({
                host: process.env.REDIS_URL || "127.0.0.1",
                port: parseNumber(process.env.REDIS_PORT, 6379),
                maxRetriesPerRequest: null,
            }),
            concurrency: parseNumber(process.env.QUEUE_CONCURRENCY, 10),
            limiter: {
                max: parseNumber(process.env.QUEUE_GLOBAL_CONCURRENCY, 60),
                duration: parseNumber(process.env.QUEUE_LIMIT_DURATION, 1000),
            },
        },
        queue: process.env.QUEUE_NAME || "mail-queue",
    },
}

export default config

export type { BullMQConfig }
