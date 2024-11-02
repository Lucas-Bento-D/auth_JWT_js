const mongoose = require('mongoose')

export const connectToDatabase = async (dbUser: string, dbPass: string) => {
    return mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.y9yyf.mongodb.net/`)
}
