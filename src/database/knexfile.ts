import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

if (!process.env.DB_URL) {
	throw Error("DB_URL is undefined or could not be parsed");
}

const config = {
	development: {
		client: "pg",
		connection: process.env.DB_URL,
		searchPath: ["knex", "public"],
		acquireConnectionTimeout: 30000, // 30 seconds
		createTimeoutMillis: 5000, // 5 seconds
		idleTimeoutMillis: 30000, // 30 seconds
		reapIntervalMillis: 5000,
		// 'knex' uses a built-in retry strategy which does not implement backoff.
		// 'createRetryIntervalMillis' is how long to idle after failed connection creation before trying again
		createRetryIntervalMillis: 200, // 0.2 seconds
		// If true, when a create fails, the first pending acquire is
		// rejected with the error. If this is false (the default) then
		// create is retried until acquireTimeoutMillis milliseconds has
		// passed.
		propagateCreateError: false,
		pool: {
			min: 1,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
			directory: "migrations",
		},
		seeds: {
			directory: "seeds",
		},
		asyncStackTraces: true,
		debug: true,
	},
};

export default config;
