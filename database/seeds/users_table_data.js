/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * * npx knex seed:run --specific=users_table_data.js
 */
exports.seed = async (knex) => {
    // pass is 123456
    await knex("user_customers").insert([
        {
            email: "customer@test.com",
            email_verified: true,
            password: "$2a$10$mYKo/KMUnAWpS5hZkAmyyuwocUTNKv1dYrJC534cT7TJ/1.cSeSF2",
        },
        {
            email: "axel.tahmid@gmail.com",
            email_verified: true,
            password: "$2a$10$mYKo/KMUnAWpS5hZkAmyyuwocUTNKv1dYrJC534cT7TJ/1.cSeSF2",
        },
    ])

    await knex("user_roles").insert([
        {
            role: "admin",
        },
        {
            role: "manager",
        },
    ])

    await knex("user_admins").insert([
        {
            email: "admin@test.com",
            password: "$2a$10$mYKo/KMUnAWpS5hZkAmyyuwocUTNKv1dYrJC534cT7TJ/1.cSeSF2",
            role_id: 1,
        },
        {
            email: "manager@test.com",
            password: "$2a$10$mYKo/KMUnAWpS5hZkAmyyuwocUTNKv1dYrJC534cT7TJ/1.cSeSF2",
            role_id: 2,
        },
    ])
}
