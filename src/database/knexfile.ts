import dotenv from "dotenv"
import type { Knex } from "knex"
import path from "node:path"

dotenv.config({ path: "../../.env" })

if (!process.env.DB_URL) {
    throw Error("DB_URL is undefined or could not be parsed")
}

type Conf = {
    development: Knex.Config
}

const config: Conf = {
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
            directory: path.resolve(__dirname, "src", "database", "migrations"),
        },
        seeds: {
            directory: path.resolve(__dirname, "src", "database", "seeds"),
        },
        asyncStackTraces: true,
        debug: true,
    } as Knex.Config,
}

export default config
