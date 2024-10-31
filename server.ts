import router from "./src/routes/routes"

require("dotenv").config()
const express = require("express")
const mongoose = require('mongoose')

const app = express()

//config json response
app.use(express.json())

app.use(router)

const dbUser = process.env.DB_USER
const dbPass =  process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.y9yyf.mongodb.net/`).then(() => {
    console.log("conectou ao banco")
    app.listen(3000)
}).catch((err: Error) => console.log(err))

