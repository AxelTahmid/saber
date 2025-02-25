class AuthRepository {
    async getUserById(app, id) {
        const user = await app.knex("auth_users").where("id", id).first()
        if (!user) throw new Error("User not found!")
        return user
    }

    async getUserByEmail(app, email) {
        const user = await app.knex("auth_users").where("email", email).first()
        return user // If not found, user will be undefined
    }

    async createUser(app, { email, password }) {
        try {
            const userID = await app.knex("auth_users").insert({ email, password }).returning("id")
            console.log("userID ==>", userID)
            return userID[0].id
        } catch (err) {
            if (err.code === app.pgerr.unique) {
                throw new Error(`User ${email} aleady exists`)
            }
            throw new Error(err)
        }
    }

    async updateUserEmailVerified(app, email) {
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

    async updateUserPassword(app, { email, password }) {
        const updated = await app.knex("auth_users").where("email", email).update({ password }).returning("id")
        if (!updated.length) {
            throw new Error(`User: ${email} not found!`)
        }
    }
}

export default new AuthRepository()
