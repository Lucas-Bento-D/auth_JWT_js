import { Router } from "express";
import checkToken from "../core/checkToken";
import { Request, Response } from "express"
import UsersController from "../controllers/users.controller";
import { transporter } from "../email/config/config";
import generateCode from "../utils/generateCode";

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = Router()


const users = new UsersController()

router.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Bem vindo a api!"})
})

router.post("/auth/register", users.Register)

router.post("/auth/login", users.Login)

router.get("/user/:id", checkToken, users.Get)

router.post("/auth/forgetPassword", users.ForgetPassword)

router.delete("/user/deleteAccount/", checkToken, users.Delete)


router.patch("/recoveryPassEmail", users.UpdateOTP, async (req: any, res: any) => {
    const {email} = req.body
    const mailOptions = {
        from: "noreply.bentodesenvolvimentos@gmail.com",
        to: email,
        subject: "teste de envio de código",
        text: `code: ${req.recoveryPass.code} \n data de expiração: ${req.recoveryPass.expirationDate}`
    }
    
    try{

        await transporter(process.env.APP_EMAIL, process.env.APP_EMAIL_PASS).sendMail(mailOptions)
        return res.status(200).json({message: "email enviado"})
    }catch(error){
        console.log(error)
    }
})


router.patch("/user/update", checkToken,  users.Update)

export default router