import { Request, Response } from "express"

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require("../models/User")

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
    public async ForgetPassword(req: any, res: any){
        const { email } = req.body
        const userExists = await User.findOne({...{email}})
        if(!userExists) return res.status(404).json({message: "usuario não encontrado!"})
    }
    public async Delete(req: any, res: any){
        // pegar o id do usuario pelo parametro gerou o problema de verificação onde qualquer usuario conseguia excluir qualquer usuario
        // const {params: { id }} = req

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
}