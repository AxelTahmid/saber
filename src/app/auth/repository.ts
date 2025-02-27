import type { Knex } from "knex"

interface EmailPassObj {
    email: string
    password: string
}
class AuthRepository {
    private db: Knex

    constructor(knex: Knex) {
        this.db = knex
    }

    public async getUserById(id: number) {
        const user = await this.db("auth_users").where("id", id).first()
        if (!user) throw new Error("User not found!")
        return user
    }

    public async getUserByEmail(email: string) {
        const user = await this.db("auth_users").where("email", email).first()
        return user // If not found, user will be undefined
    }

    public async createUser({ email, password }: EmailPassObj) {
        try {
            const userID = await this.db("auth_users").insert({ email, password }).returning("id")
            return userID[0].id
        } catch (err) {
            if (err instanceof Error && "code" in err && err.code === this.db.pgerr.unique) {
                throw new Error(`User ${email} aleady exists`)
            }
            throw new Error(String(err))
        }
    }

    public async updateUserEmailVerified(email: string) {
        const updatedUsers = await this.db("auth_users")
            .where("email", email)
            .update({ email_verified: true })
            .returning(["id", "email", "is_banned"])

        if (!updatedUsers.length) {
            throw new Error(`User: ${email} not found!`)
        }
        return updatedUsers[0]
    }

    public async updateUserPassword({ email, password }: EmailPassObj) {
        const updated = await this.db("auth_users").where("email", email).update({ password }).returning("id")
        if (!updated.length) {
            throw new Error(`User: ${email} not found!`)
        }
    }
}

export default AuthRepository
