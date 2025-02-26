import "dotenv/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { RedisOptions } from "ioredis";

/* ----------------------------------------------------------------------------
 * Configuration Interfaces
 * -------------------------------------------------------------------------- */

interface CaptchaConfig {
	secret?: string;
}

interface CorsConfig {
	origin: RegExp[];
	method: string[];
	allowedHeaders: string[];
	credentials: boolean;
}

interface SqlConfig {
	client: string;
	searchPath: string[];
	acquireConnectionTimeout: number;
	connection: string;
	pool: {
		min: number;
		max: number;
	};
}

interface MulterConfig {
	fieldNameSize: number;
	fieldSize: number;
	fields: number;
	fileSize: number;
	files: number;
}

interface StorageConnectionConfig {
	forcePathStyle: boolean;
	endpoint?: string;
	region?: string;
	credentials: {
		accessKeyId?: string;
		secretAccessKey?: string;
	};
}

interface StorageConfig {
	multer: MulterConfig;
	connection: StorageConnectionConfig;
	bucket?: string;
}

interface HealthcheckSchema {
	type: string;
	properties: {
		eventLoopDelay: { type: string };
		eventLoopUtilized: { type: string };
		rssBytes: { type: string };
		heapUsed: { type: string };
	};
}

interface HealthcheckConfig {
	maxEventLoopDelay: number;
	maxEventLoopUtilization: number;
	message: string;
	retryAfter: number;
	exposeStatusRoute: {
		routeResponseSchemaOpts: {
			metrics: HealthcheckSchema;
		};
	};
	healthCheck: (
		app: FastifyInstance
	) => Promise<{ metrics: ReturnType<FastifyInstance["memoryUsage"]> }>;
}

interface MailerDefaults {
	from: string;
	subject: string;
}

interface MailerTransport {
	service: string;
	auth: {
		user?: string;
		pass?: string;
	};
}

interface MailerConfig {
	defaults: MailerDefaults;
	transport: MailerTransport;
}

interface BullMQWorkerLimiter {
	max: number;
	duration: number;
}

interface BullMQWorkerOptions {
	concurrency: number;
	limiter: BullMQWorkerLimiter;
}

interface BullMQJobOptions {
	attempts: number;
	backoff: {
		type: string;
		delay: number;
	};
}

interface BullMQConfig {
	redis: RedisOptions;
	job_options: BullMQJobOptions;
	worker_options: BullMQWorkerOptions;
	queue: string;
}

interface RateLimitConfig {
	redis: RedisOptions;
	max: number;
	timeWindow: number;
	nameSpace: string;
	keyGenerator: (req: FastifyRequest) => string;
}

interface AppConfig {
	host: string;
	port: number;
	isDevEnvironment: boolean;
	captcha: CaptchaConfig;
	cors: CorsConfig;
	sql: SqlConfig;
	storage: StorageConfig;
	redis: RedisOptions;
	healthcheck: HealthcheckConfig;
	mailer: MailerConfig;
	bullMQ: BullMQConfig;
	rate_limit: RateLimitConfig;
}

/* ----------------------------------------------------------------------------
 * Environment Parsing Helpers
 * -------------------------------------------------------------------------- */

const parseNumber = (value: string | undefined, defaultValue: number): number =>
	value ? Number(value) : defaultValue;

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
		connection: process.env.DB_URL || "",
		pool: {
			min: 1,
			max: 50,
		},
	},
	storage: {
		multer: {
			fieldNameSize: 100,
			fieldSize: 100,
			fields: 2,
			fileSize: 1000000,
			files: 1,
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
		host: process.env.REDIS_URL || "127.0.0.1",
		port: parseNumber(process.env.REDIS_PORT, 6379),
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
			concurrency: parseNumber(process.env.QUEUE_CONCURRENCY, 10),
			limiter: {
				max: parseNumber(process.env.QUEUE_GLOBAL_CONCURRENCY, 60),
				duration: parseNumber(process.env.QUEUE_LIMIT_DURATION, 1000),
			},
		},
		queue: process.env.QUEUE_NAME || "mail-queue",
	},
	rate_limit: {
		redis: {
			host: process.env.REDIS_URL || "127.0.0.1",
			port: parseNumber(process.env.REDIS_PORT, 6379),
			connectTimeout: 500,
			maxRetriesPerRequest: 1,
		},
		max: 60,
		timeWindow: 1000 * 60,
		nameSpace: "limit:",
		keyGenerator: (req: FastifyRequest) => {
			const key = req.headers["x-forwarded-for"] || req.ip;
			return `${key}:${req.routeOptions.url}`;
		},
	},
};

export default config;
