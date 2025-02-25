import fp from "fastify-plugin"
import knex from "knex"

function fastifyKnex(fastify, options, next) {
    try {
        if (!fastify.knex) {
            const handler = knex(options)

            fastify.decorate("knex", handler)

            fastify.addHook("onClose", (fastify, done) => {
                if (fastify.knex === handler) {
                    fastify.knex.destroy(done)
                }
            })
        }

        fastify.decorate("paginate_data", paginate(fastify.knex))

        next()
    } catch (err) {
        next(err)
    }
}

/**
 * * Pagination function decorated in knex plugin
 * @param {*} knex
 * @param {string} props { per_page, current_page, table, query, sort }
 * @returns pagination
 */
const paginate = (knex) => async (props) => {
    const pagination = {}
    const per_page = props.per_page || 20
    const sort = props.orderBy || "desc"
    let page = props.current_page || 1

    if (page < 1) page = 1

    const offset = (page - 1) * per_page

    const data_query = props.query
        ? props.query.offset(offset).limit(per_page)
        : knex(props.table).orderBy("id", sort).offset(offset).limit(per_page)

    const [total, rows] = await Promise.all([knex(props.table).count("* as count").first(), data_query])

    pagination.total = props.query ? rows.length : total.count
    pagination.per_page = per_page
    pagination.offset = offset
    pagination.to = offset + rows.length
    pagination.last_page = Math.ceil(total.count / per_page)
    pagination.current_page = page
    pagination.from = offset
    pagination.data = rows

    return pagination
}

export default fp(fastifyKnex, {
    name: "knex",
})
