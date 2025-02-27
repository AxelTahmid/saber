import type { Knex } from "knex"

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<Knex.SchemaBuilder> }
 */
export function up(knex: Knex): Promise<Knex.SchemaBuilder> {
    return knex.raw(`
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<Knex.SchemaBuilder> }
 */
export function down(knex: Knex): Promise<Knex.SchemaBuilder> {
    return knex.raw("DROP FUNCTION IF EXISTS set_updated_at")
}
