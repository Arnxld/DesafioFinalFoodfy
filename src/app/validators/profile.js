const UserModel = require("../models/UserModel")
const {compare} = require('bcryptjs')


async function index(req,res,next) {
    const {userId: id} = req.session

    const user = await UserModel.findOne({ where: {id} })

    if(!user) return res.render("admins/register", {
        createError: "Usuário não encontrado"
    })

    req.user = user
    
    
    next()
}

async function update(req, res, next) {
    // checar se todos os campos estão preenchidos
    const keys = Object.keys(req.body)

    for (key of keys) {
        if(req.body[key] == "") {
            return res.render("admins/user/profile", {
                user: req.body,
                createError: "Preencha todos os campos"
            })
        }
    }

    // preencheu a senha?
    const {id, password} = req.body
    if (!password) return res.render("admins/user/profile", {
        user: req.body,
        createError: "Preencha todos os campos"
    })

    // a senha entrada combina com a do db
    const user = await UserModel.findOne({ where: {id} })

    const passed = await compare(password, user.password)

    if(!passed) return res.render("admins/user/profile", {
        user: req.body,
        createError: "Use a senha que usou para se cadastrar"
    })

    req.user = user


    next()
}

module.exports = {
    index,
    update
}