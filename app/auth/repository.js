class AuthRepository {
    async getUserById(app, id) {
        const user = await app.knex("auth_users").where("id", id).first()
        if (!user) throw app.httpErrors.notFound("User not found!")
        return user
    }

    async getUserByEmail(app, email) {
        return await app.knex("auth_users").where("email", email).first()
    }

    async createUser(app, { email, password }) {
        const userID = await app.knex("auth_users").insert({ email, password }).returning("id")
        return userID[0].id
    }

    async updateUserEmailVerified(app, email) {
        const updatedUsers = await app
            .knex("auth_users")
            .where("email", email)
            .update({ email_verified: true })
            .returning(["id", "email", "is_banned"])

        if (!updatedUsers.length) {
            throw app.httpErrors.notFound(`User: ${email}, not found!`)
        }

        return updatedUsers[0]
    }

    async updateUserPassword(app, { email, password }) {
        const updated = await app.knex("auth_users").where("email", email).update({ password }).returning("id")
        if (!updated.length) {
            throw app.httpErrors.notFound(`User: ${email}, not found!`)
        }
    }
}

export default new AuthRepository()
