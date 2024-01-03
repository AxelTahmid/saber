/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.schema.createTable('user_admins', table => {
		table.increments('id')
		table.string('email', 128).unique().notNullable()
		table.string('password', 64).notNullable()
		table.timestamps(true, true)

		table.integer('role_id').unsigned()
		table
			.foreign('role_id')
			.references('id')
			.inTable('user_roles')
			.onDelete('SET NULL')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.schema.dropTableIfExists('user_admins')
}
