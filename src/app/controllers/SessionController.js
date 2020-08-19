const crypto = require('crypto') // bilioteca para criar o token de recuperação
const UserModel = require('../models/UserModel')
const mailer = require('../../lib/mailer')
const {hash} = require('bcryptjs')

module.exports = {
    loginForm(req, res) {
        return res.render("admins/session/login")
    },
    login(req, res) {
        req.session.userId = req.user.id

        return res.redirect("/admin/recipes")
    },
    logout(req, res) {
        req.session.destroy()

        return res.redirect('/login')
    },
    forgotForm(req, res) {
        return res.render('admins/session/forgot-password')
    },
    async forgot(req, res) {
        try {
            const {user} = req

            // token para o usuário
            const token = crypto.randomBytes(20).toString('hex')

            // criar uma expiração do token
            let now = new Date()
            now = now.setHours(now.getHours() + 1)

            await UserModel.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            })

            // enviar um email com um link de recuperação
            await mailer.sendMail({
                to:user.email,
                from: 'no-reply@foodfy.com.br',
                subject: "Recuperação de senha",
                html: `<h2>Esqueceu sua senha?</h2>
                <p>Não se preocupe, clique no link abaixo para redefinir sua senha!<p>
                <p>
                    <a href="http://localhost:3000/password-reset?token=${token}" target="_blank">
                        clique aqui
                    </a>
                <p>
                `
            })

            // avisar o usuário
            return res.render("admins/session/forgot-password", {
                success:"Verifique seu email!"
            })

        }
        catch(err) {
            console.error(err)
            return res.render("admins/session/forgot-password", {
                error:"Erro inesperado! Tente novamente."
            })
        }
        
    },
    resetForm(req, res) {
        const token = req.query.token
        return res.render('admins/session/password-reset', {token})
    },
    async reset(req, res) {
        try {
            const {user} = req
            const {password} = req.body
           

            // criar novo hash
            const newPassword = await hash(password, 8)

            // atualizar usuário
            await UserModel.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: ""
            })


            // avisar o usuário o sucesso
            return res.render("admins/session/login", {
                user:req.body,
                success: "Senha atualizada! Faça seu login."
            })

        }
        catch(err) {
            console.error(err)
            return res.render("admins/session/password-reset", {
                error:"Erro inesperado! Tente novamente."
            })
        }


    }
}