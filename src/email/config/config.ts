const nodemail = require('nodemailer')

export const transporter = (user?: string, pass?:string) => nodemail.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // usar SSL
    auth: {
        user,
        pass,
    }
})