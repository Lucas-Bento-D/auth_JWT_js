import { Request, Response, NextFunction } from "express"
const jwt = require('jsonwebtoken')

const checkToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token) return res.status(403).json({message: "acesso negado"})
    
    try {
        const secret = process.env.SECRET
        const decoded = jwt.verify(token, secret)
        req.userId = decoded.id
        next()
    } catch (error) {
        res.status(400).json({message: 'Token invalido'})
    }
}

export default checkToken