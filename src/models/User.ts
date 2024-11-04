const mongoose = require('mongoose')

const User: IUser = mongoose.model('User', {
    name: String,
    email: String,
    password: String,
    recoveryPass: {
        code: String,
        expirationDate: Date
    }
})

module.exports = User