/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
    // Create the auth_users table
    await knex.schema.createTable("auth_users", (table) => {
        table.specificType("id", "INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,")
        table.text("email").notNullable().defaultTo("")
        table.boolean("email_verified").notNullable().defaultTo(false)
        table.text("password").notNullable()
        table
            .enu("role", ["admin", "manager", "customer"], {
                useNative: true,
                enumName: "role_type",
            })
            .notNullable()
            .defaultTo("customer")
        // Timestamps with timezone
        table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"))
        table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"))
    })

    // Create a trigger to update the updated_at column on row update
    await knex.raw(`
        CREATE TRIGGER set_auth_user_updated_at
        BEFORE UPDATE ON auth_users
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
    // Drop the enum type, trigger, and table
    await knex.raw("DROP TYPE IF EXISTS role_type CASCADE;")
    await knex.raw("DROP TRIGGER IF EXISTS set_auth_user_updated_at ON auth_users;")
    await knex.schema.dropTableIfExists("auth_users")
}
