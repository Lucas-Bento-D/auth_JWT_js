interface IUser {
    name: string, 
    email: string, 
    password?: string,
    recoveryPass?: IRecoveryPass
}
interface IRecoveryPass{
    code: string,
    expirationDate: Date
}