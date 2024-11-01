import { Router } from "express";
import checkToken from "../core/checkToken";
import { Request, Response } from "express"
import UsersController from "../controllers/users.controller";

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

router.delete("/user/deleteAccount/:id", checkToken, users.Delete)

export default router