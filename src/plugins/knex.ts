import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import knex, { type Knex } from "knex";

declare module "fastify" {
	interface FastifyInstance {
		knex: Knex;
		pgerr: { unique: string };
		paginate: PaginateFn;
	}
}

function fastifyKnex(
	fastify: FastifyInstance,
	options: Knex.Config,
	next: (err?: Error) => void
) {
	try {
		if (!fastify.knex) {
			const handler = knex(options);
			fastify.decorate("knex", handler);

			fastify.addHook("onClose", (instance, done: (err?: Error) => void) => {
				if (instance.knex === handler) {
					instance.knex.destroy(done);
				}
			});
		}

		fastify.decorate("pgerr", Object.freeze(pgErrCodes));
		fastify.decorate("paginate", paginate(fastify.knex));

		next();
	} catch (err) {
		next(err as Error);
	}
}

/**
 * Pagination function.
 * If params.query is provided, it will paginate the query;
 * otherwise, it builds a new query on the given table.
 */
// Define the paginate parameters interface.
interface PaginateParams {
	per_page?: number;
	current_page?: number;
	table: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	query?: Knex.QueryBuilder<any, any>;
	orderBy?: string;
}

// Define the pagination result interface.
interface PaginationResult<T> {
	total: number;
	per_page: number;
	offset: number;
	to: number;
	last_page: number;
	current_page: number;
	from: number;
	data: T[];
}

// Define the type of the paginate function.
type PaginateFn = <T>(params: PaginateParams) => Promise<PaginationResult<T>>;

const paginate =
	(knex: Knex): PaginateFn =>
	async <T>(params: PaginateParams): Promise<PaginationResult<T>> => {
		const per_page = params.per_page ?? 20;
		const sort = params.orderBy ?? "desc";
		let page = params.current_page ?? 1;
		if (page < 1) page = 1;

		const offset = (page - 1) * per_page;

		// Use provided query or create a new one on the table.
		const data_query = params.query
			? params.query.offset(offset).limit(per_page)
			: knex(params.table).orderBy("id", sort).offset(offset).limit(per_page);

		// Count total rows and fetch paginated data.
		const [totalResult, rows] = await Promise.all([
			knex(params.table).count<{ count: string }>("* as count").first(),
			data_query,
		]);

		// Convert the count (which may be returned as a string) to a number.
		const totalCount = totalResult ? Number.parseInt(totalResult.count, 10) : 0;

		const pagination: PaginationResult<T> = {
			total: params.query ? rows.length : totalCount,
			per_page,
			offset,
			to: offset + rows.length,
			last_page: Math.ceil(totalCount / per_page),
			current_page: page,
			from: offset,
			data: rows,
		};

		return pagination;
	};

const pgErrCodes = {
	unique: "23505",
};

export default fp(fastifyKnex, {
	fastify: ">=5.0.0",
	name: "knex",
});
