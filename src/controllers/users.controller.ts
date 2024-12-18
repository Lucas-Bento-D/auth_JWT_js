import { Request, Response } from "express"
import generateCode from "../utils/generateCode";

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require("../models/User")
const mongoose = require("mongoose");

export default class UsersController {
    public async Get (req: any, res: any) {
        const {params: { id }} = req
    
        //check if user logged
        // '-{field}' is a params ignore a field of entity
        const user = await User.findById(id, '-password')
    
        if(!user) return res.status(404).json({message: "O usuario não existe"})
        
        res.status(200).json({user})
    }
    public async Register (req: any, res: any) {

        const {name, email, password, confirmPassword} = req.body
    
        if(!name) return res.status(422).json({message: "Nome é obrigatorio"})
        if(!email) return res.status(422).json({message: "Email é obrigatorio"})
        if(!password) return res.status(422).json({message: "Password é obrigatorio"})
        if(password != confirmPassword) return res.status(422).json({message: "Senhas não conferem"})
        
        //check email exists
        const userExists = await User.findOne({...{email}})
        if(userExists) return res.status(422).json({message: "Por favor, utilize outro email"})
        
        //create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)
    
        //create user
        const user = new User({
            name,
            email,
            password: passwordHash
        })
    
        try{
            await user.save()
            return res.status(201).json({message: "Usuario criado com sucesso"})
        }catch(error){
            console.log(error)
            return res.status(500).json({message: 'Aconteceu um erro no servidor, tente mais tarde'})
        }
    
    }
    public async Login (req: any, res: any){
        const {email, password} = req.body
    
        //user validation
        if(!email) return res.status(422).json({message: "Email é obrigatorio"})
        if(!password) return res.status(422).json({message: "Password é obrigatorio"})
        
        //check user exists
        const user = await User.findOne({...{email}})
        if(!user) return res.status(404).json({message: "O usuario não existe"})
        
        //password validation
        const checkPassword = await bcrypt.compare(password, user.password)
    
        if(!checkPassword) return res.status(422).json({message: "Senha invalida"})
    
        //user autentication
        try{
            const secret = process.env.SECRET
            const token = jwt.sign({
                id: user.id
            }, secret)
            
            return res.status(200).json({message: "Autenticação realizada com sucesso!", token})
        }catch(error){
            console.log(error)
            return res.status(500).json({message: 'Aconteceu um erro no servidor, tente mais tarde'})
        }
    }
    public async RecoveryPassword(req: any, res: any){
        const { body: {email, password, confirmPassword}, params: {code} } = req

        if(!email) return res.status(422).json({message: "Email é obrigatorio"})
        if(!password) return res.status(422).json({message: "Password é obrigatorio"})
        
        const user = await User.findOne({...{email}})
        if(!user) return res.status(404).json({message: "O usuario não existe"})
        
        //code validation
        const checkCode = await bcrypt.compare(code, user.recoveryPass.code)
        if(!checkCode) return res.status(422).json({message: "Código invalido!"})

        if(password != confirmPassword) return res.status(422).json({message: "Senhas não conferem"})

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)
        const newPass = {
            password: passwordHash,
            recoveryPass: {
                code: ""
            }
        }

        try{
            await User.updateOne({...{email}}, newPass, { status: req.status })
            return res.status(201).json({message: 'Senha atualizada com sucesso!'})
        }catch(error){
            console.log(error)
            return res.status(500).json({message: 'Aconteceu um erro no servidor, tente mais tarde'})
        }
    }
    public async Delete(req: any, res: any){
        // a função checkToken agora seta o id e assim pegamos na função, excluindo sempre o usuario autenticado
        const {userId: id} = req
        try{
            await User.findByIdAndDelete(id)
            return res.status(201).json({message: "Usuario deletado com sucesso"})
        }catch(error){
            console.log(error)
            return res.status(500).json({message: 'Aconteceu um erro no servidor, tente mais tarde'})
        }
    }
    public async Update(req: any, res: any){
        const _id = new mongoose.Types.ObjectId(req.userId)
        const {name, email, password, confirmPassword} = req.body
        let user: IUser = {
            name,
            email,
        }

        if(password != confirmPassword) return res.status(422).json({message: "Senhas não conferem"})
        if(password && confirmPassword){
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user = {
                name,
                email,
                password: passwordHash
            }
        }

        try{
            await User.updateOne({...{_id}}, user, { status: req.status })
            return res.status(201).json({message: 'Usuario atualizado com sucesso!'})
        }catch(error){
            console.log(error)
            return res.status(500).json({message: 'Aconteceu um erro no servidor, tente mais tarde'})
        }
    }
    public async UpdateOTP(req: any, res: any, next: any){
        const {email} = req.body

        const code = generateCode()
        const salt = await bcrypt.genSalt(12)
        const codeHash = await bcrypt.hash(code, salt)
        const recoveryPass = {
            code: codeHash,
        }

        const userExists = await User.findOne({...{email}})
        if(!userExists) return res.status(422).json({message: "Por favor, utilize outro email"})

        try{
            await User.findOneAndUpdate({email}, {...{recoveryPass}}, { status: req.status })
            req.recoveryPass = {code}
            next()
        }catch(error){
            console.log(error)
            return res.status(500).json({message: 'Aconteceu um erro no servidor, tente mais tarde'})
        }
    }
}