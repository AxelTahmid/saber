import type { FastifyInstance } from "fastify"

interface EmailPassObj {
    email: string
    password: string
}
class AuthRepository {
    async getUserById(app: FastifyInstance, id: number) {
        const user = await app.knex("auth_users").where("id", id).first()
        if (!user) throw new Error("User not found!")
        return user
    }

    async getUserByEmail(app: FastifyInstance, email: string) {
        const user = await app.knex("auth_users").where("email", email).first()
        return user // If not found, user will be undefined
    }

    async createUser(app: FastifyInstance, { email, password }: EmailPassObj) {
        try {
            const userID = await app.knex("auth_users").insert({ email, password }).returning("id")
            return userID[0].id
        } catch (err) {
            if (err instanceof Error && "code" in err && err.code === app.pgerr.unique) {
                throw new Error(`User ${email} aleady exists`)
            }
            throw new Error(String(err))
        }
    }

    async updateUserEmailVerified(app: FastifyInstance, email: string) {
        const updatedUsers = await app
            .knex("auth_users")
            .where("email", email)
            .update({ email_verified: true })
            .returning(["id", "email", "is_banned"])

        if (!updatedUsers.length) {
            throw new Error(`User: ${email} not found!`)
        }
        return updatedUsers[0]
    }

    async updateUserPassword(app: FastifyInstance, { email, password }: EmailPassObj) {
        const updated = await app.knex("auth_users").where("email", email).update({ password }).returning("id")
        if (!updated.length) {
            throw new Error(`User: ${email} not found!`)
        }
    }
}

export default new AuthRepository()
