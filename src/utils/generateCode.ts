const generateCode = (): string => {
    const code = Math.floor(Math.random() * 1000000).toString()
    return code.padStart(6, '')
}
export default generateCode