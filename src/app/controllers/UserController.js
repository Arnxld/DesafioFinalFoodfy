const UserModel = require("../models/UserModel")
const mailer = require('../../lib/mailer')

module.exports = {
    async list(req, res) {
        const users = await UserModel.all()
        return res.render("admins/user/index", {users})
    },
    registerForm(req,res) {
        return res.render("admins/user/register")
    },
    async post(req, res) {
        const {id, email, password} = await UserModel.create(req.body)

        const user = await UserModel.findOne({ where: {id} })

        await mailer.sendMail({
            to:email,
            from: 'no-reply@foodfy.com.br',
            subject: "Dados de acesso ao Foodfy",
            html: `<h2>Seja bem vindo ao Foodfy, ${user.name}</h2>
            <p>Agora com sua conta criada, você é oficialmente um membro da nossa comunidade!<p>
            <br>
            <p>Aqui estão seus dados de acesso à plataforma:<p>
            <p>Usuário: ${email}
            <p>Senha: ${password}<p>
            <br>
            <p> Lembre-se de que pode alterar sua senha a qualquer momento dentro da plataforma.<p>
            `
        })

        // avisar o usuário
        let users = await UserModel.all()
        return res.render("admins/user/index", {
            users,
            createSuccess:"Email enviado ao usuário!"
        })
    },
    async updateForm(req, res) {
        const id = req.params.id

        const user = await UserModel.findOne({ where: {id} })
        return res.render("admins/user/edit", {user})
    },
    async put(req, res) {
        let {name, email, is_admin, id} = req.body
        await UserModel.update(id, {
            name,
            email,
            is_admin
        })

        return res.render("admins/user/edit", {
            user: req.body,
            createSuccess: "Usuário atualizado com sucesso"
        })
    },
    async delete(req, res) {
        try{
            await UserModel.delete(req.body.id)
            let users = await UserModel.all()

            return res.render ("admins/user/index", {
                users,
                createSuccess: "Usuário deletado com sucesso"
            })
        }
        catch(err) {
            console.error(err)
            return res.render("admins/user/index", {
                user: req.body,
                createError: "Erro ao tentar atualizar o usuário. Tente novamente!"
            })
        }
    }
}