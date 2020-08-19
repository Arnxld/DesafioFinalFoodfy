const UserModel = require('../models/UserModel')
const {compare} = require('bcryptjs')

async function login(req, res, next) {
    const {email, password} = req.body

    // verificar se o usuário está cadastrado
    const user = await UserModel.findOne({ where: {email} })

    if(!user) return res.render("admins/session/login", {
        user: req.body,
        Error: "Usuário não cadastrado."
    })


    // verificar se a senha confere
    const passed = await compare(password, user.password)

    if(!passed) return res.render("admins/session/login", {
        user: req.body,
        Error: "Senha incorreta!"
    })

    req.user = user

    next()
}

async function forgot(req, res, next) {
    try{
        const { email } = req.body

        let user = await UserModel.findOne({ where: {email} })

        if(!user) return res.render("admins/session/forgot-password", {
            user: req.body,
            Error: "Email não cadastrado."
        })

        req.user = user

        next()
    }
    catch(err) {
        console.error(err)

        return res.render("admins/session/forgot-password", {
            user: req.body,
            Error: "Erro inesperado! Tente novamente"
        })
    }
    
}

async function reset(req, res, next) {
    try {

        //procurar o usuário
        const { email, token, password, passwordRepeat } = req.body

        const user = await UserModel.findOne({ where: {email} })
        if (!user) res.render("admins/session/password-reset", {
            user: req.body,
            token,
            Error: "Email não cadastrado!"
        })

        // ver se a senha bate
        if (password != passwordRepeat) res.render("admins/session/password-reset", {
            user: req.body,
            token,
            Error: "Repetição de senha incorreta!"
        })

        // verificar se o token bate
        if(token != user.reset_token) res.render("admins/session/password-reset", {
            user: req.body,
            token,
            Error: "Token Inválido! Solicite outra troca de senha antes de tentar novamente."
        })

        // verificar se o token não expirou
        let now = new Date()
        now = now.setHours(now.getHours)

        if(now > user.reset_token_expires) res.render("admins/session/password-reset", {
            user: req.body,
            token,
            Error: "Token Expirado! Solicite outra troca de senha antes de tentar novamente."
        })

        req.user = user

        next()
    }
    catch(err) {
        console.error(err)
    }
}

module.exports = {
    login,
    forgot,
    reset
}