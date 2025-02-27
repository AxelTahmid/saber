import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import knex, { type Knex } from "knex"

declare module "fastify" {
    interface FastifyInstance {
        knex: Knex
    }
}

declare module "knex" {
    interface Knex {
        pgerr: { unique: string }
        paginate: PaginateFn
    }
}

async function fastifyKnex(fastify: FastifyInstance, opts: Knex.Config) {
    if (!fastify.knex) {
        const pgInstance = knex(opts)

        const ping = await pgInstance.raw("SELECT current_timestamp - pg_postmaster_start_time() AS uptime;")
        fastify.log.info({ uptime: ping.rows[0].uptime }, "db: successfully connected, uptime ==>")

        // Extend the Knex instance with our custom properties.
        pgInstance.pgerr = Object.freeze(pgErrCodes)
        pgInstance.paginate = paginate(pgInstance)

        fastify.decorate("knex", pgInstance)

        fastify.addHook("onClose", (app, done: (err?: Error) => void) => {
            if (app.knex === pgInstance) {
                app.knex.destroy(done)
            }
        })
    }
}

const pgErrCodes = {
    unique: "23505",
} as const

/**
 * Pagination function.
 * If params.query is provided, it will paginate the query;
 * otherwise, it builds a new query on the given table.
 */
// Define the paginate parameters interface.
interface PaginateParams {
    per_page?: number
    current_page?: number
    table: string
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    query?: Knex.QueryBuilder<any, any>
    orderBy?: string
}

// Define the pagination result interface.
interface PaginationResult<T> {
    total: number
    per_page: number
    offset: number
    to: number
    last_page: number
    current_page: number
    from: number
    data: T[]
}

// Define the type of the paginate function.
type PaginateFn = <T>(params: PaginateParams) => Promise<PaginationResult<T>>

const paginate =
    (knex: Knex): PaginateFn =>
    async <T>(params: PaginateParams): Promise<PaginationResult<T>> => {
        const per_page = params.per_page ?? 20
        const sort = params.orderBy ?? "desc"
        let page = params.current_page ?? 1
        if (page < 1) page = 1

        const offset = (page - 1) * per_page

        // Use provided query or create a new one on the table.
        const data_query = params.query
            ? params.query.offset(offset).limit(per_page)
            : knex(params.table).orderBy("id", sort).offset(offset).limit(per_page)

        // Count total rows and fetch paginated data.
        const [totalResult, rows] = await Promise.all([
            knex(params.table).count<{ count: string }>("* as count").first(),
            data_query,
        ])

        // Convert the count (which may be returned as a string) to a number.
        const totalCount = totalResult ? Number.parseInt(totalResult.count, 10) : 0

        const pagination: PaginationResult<T> = {
            total: params.query ? rows.length : totalCount,
            per_page,
            offset,
            to: offset + rows.length,
            last_page: Math.ceil(totalCount / per_page),
            current_page: page,
            from: offset,
            data: rows,
        }

        return pagination
    }

export default fp(fastifyKnex, {
    fastify: ">=5.0.0",
    name: "knex",
})
