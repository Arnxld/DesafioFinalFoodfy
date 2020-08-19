const UserModel = require("../models/UserModel")

module.exports = {
    async index(req, res) { // dados do usuário logado
        const {user} = req

        return res.render('admins/user/profile', {user})
    },

    async put(req, res) {
        
        try{
            let user = req.user
            let {name, email} = req.body

            await UserModel.update(user.id, {
                name,
                email
            })

            return res.render("admins/user/profile", {
                user: req.body,
                createSuccess: "Dados atualizados com sucesso!"
            })
        }
        catch(err) {
            console.error(err)
            return res.render("admins/user/profile", {
                user: req.body,
                createError: "Erro inesperado! Tente novamente"
            })
        }
    }
}