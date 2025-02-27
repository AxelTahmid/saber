import type { Knex } from "knex"

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * * npx knex seed:run --specific=users_table_data.js
 */
export default async function seed(knex: Knex): Promise<void> {
    // pass is 123456
    await knex("auth_users").insert([
        {
            email: "customer@test.com",
            email_verified: true,
            role: "customer",
            password: "$2a$10$mYKo/KMUnAWpS5hZkAmyyuwocUTNKv1dYrJC534cT7TJ/1.cSeSF2",
        },
        {
            email: "admin@test.com",
            email_verified: true,
            role: "admin",
            password: "$2a$10$mYKo/KMUnAWpS5hZkAmyyuwocUTNKv1dYrJC534cT7TJ/1.cSeSF2",
        },
    ])
}
