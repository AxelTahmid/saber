/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.schema.createTable('user_roles', table => {
		table.increments('id')
		table.string('role', 128).unique().notNullable()
		table.timestamps(true, true)
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.schema.dropTableIfExists('user_roles')
}
