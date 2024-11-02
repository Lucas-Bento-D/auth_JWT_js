import { connectToDatabase } from "./src/database/config/config"
import router from "./src/routes/routes"

require("dotenv").config()
const express = require("express")
const app = express()

//config json response
app.use(express.json())
app.use(router)
const dbUser = process.env.DB_USER || ""
const dbPass =  process.env.DB_PASS || ""

async function main(): Promise<void>{
    try{
        await connectToDatabase(dbUser, dbPass)
        console.log("conectou ao banco")
        app.listen(3000)
    }catch(error) { console.log(error) }
}

main()