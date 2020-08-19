const UserModel = require('../models/UserModel')
const Recipe = require('../models/Recipe')
const File = require('../models/File')

function onlyUsers(req, res, next) {
    if(!req.session.userId)
        return res.redirect('/login')


    next()
}

function isLogged(req, res, next) {
    if(req.session.userId)
        return res.redirect('/admin/profile')

    next()
}

async function isAdmin(req, res, next) {
    const {userId: id} = req.session

    if(!id) {
        return res.redirect('/')
    }
    const user = await UserModel.findOne( {where: {id}})

    if(!user.is_admin) {
        return res.redirect('/')
    }
    
    next()
}

async function onlyOwnUsers(req, res, next) {
    if(!req.session.userId)
        return res.redirect('/login')

    const user = await UserModel.findOne(req.session.userId)

    const recipeResult = await Recipe.find(req.params.id)
    const recipe = recipeResult.rows[0]

    let results = await Recipe.files(recipe.id)
    let recipe_files = results.rows
    let filesId = recipe_files.map(row => row.file_id)

    let filesPromise = filesId.map(id => File.find(id))
    results = await Promise.all(filesPromise)

    const files = results.map(result => ({
        ...result.rows[0],
        src: `${req.protocol}://${req.headers.host}${result.rows[0].path.replace("public","")}`
    }))
    
    if(!user.is_admin) {
        if(recipe.user_id != req.session.userId) {
            return res.render("admins/recipes/show", {
                recipe,
                files,
                createError:'Você não tem permissão para alterar esta receita!'
            })
        }
    }


    next()
}


module.exports = {
    onlyUsers,
    isLogged,
    onlyOwnUsers,
    isAdmin
}