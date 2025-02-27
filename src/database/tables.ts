import type { Knex } from "knex"

declare module "knex/types/tables.js" {
    // Define the shape of a row in the "auth_users" table.
    interface AuthUser {
        id: number
        email: string
        email_verified: boolean
        password: string
        role: "admin" | "manager" | "customer"
        created_at: string
        updated_at: string
    }

    interface Tables {
        // When using knex<AuthUser>('auth_users') the type will be AuthUser
        auth_users: AuthUser

        // For more advanced typing, we create a composite type.
        // Here:
        // - The base type (AuthUser) is used for return values and for "where" clauses.
        // - The "insert" type requires "email", "password", and "role".
        //   The fields "email_verified", "created_at", and "updated_at" are optional since they have defaults.
        // - The "update" type is a partial of AuthUser (except "id", which remains read-only).
        auth_users_composite: Knex.CompositeTableType<
            AuthUser,
            Pick<AuthUser, "email" | "password" | "role"> &
                Partial<Pick<AuthUser, "email_verified" | "created_at" | "updated_at">>,
            Partial<Omit<AuthUser, "id">>
        >
    }
}
