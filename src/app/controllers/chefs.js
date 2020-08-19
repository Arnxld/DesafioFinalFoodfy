const Chef = require("../models/Chef")
const File = require("../models/File")
const Recipe = require("../models/Recipe")


module.exports = {
    async index(req, res) {
        let results = await Chef.all()
        let chefs = results.rows

        async function getImage(fileId) {
            let result = await Chef.file(fileId)
            const file = result.rows[0]
            fileURL = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            return fileURL
        }

        const chefsPromise = chefs.map(async chef => {
        chef.img = await getImage(chef.file_id)
        return chef
        })

        chefs = await Promise.all(chefsPromise)



        return res.render('admins/chefs/index', {chefs})
            
        
    },
    create(req, res) {
        res.render("admins/chefs/create")
    },

    async post(req,res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if(req.body[key] == "") return res.send("Por favor preencha todos os dados da receita.")
        }

        let result = await File.create(req.file)
        let fileId = result.rows[0].id

        result = await Chef.create(req.body, fileId)
        let chefId = result.rows[0].id  



        return res.redirect(`/admin/chefs/${chefId}/edit`)
    },

    async show(req, res) {
        const {id} = req.params

        let result = await Chef.find(id)
        let chef = result.rows[0]

        async function getImage(fileId) {
            let result = await Chef.file(fileId)
            const file = result.rows[0]
            fileURL = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            return fileURL
        }

        chef.img = await getImage(chef.file_id)

        let results = await Chef.showRecipes(id)
        let recipes = results.rows

        async function getRecipeImage(recipeId) {
            let results = await Recipe.files(recipeId)
            const filesId = results.rows.map(result => result.file_id)
            let filesPromise = filesId.map(id => File.find(id))
            results = await Promise.all(filesPromise)
            let files = results.map(result => result.rows[0])
            const filesURL = files.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)

            return filesURL[0]
        }

        const recipesPromise = recipes.map(async recipe => {
            recipe.img = await getRecipeImage(recipe.id)
            return recipe
        })

        recipes = await Promise.all(recipesPromise)

        return res.render('admins/chefs/show', {chef, recipes})
        
    },
    
    async edit(req, res) {
        const {id} = req.params

        // get chef
        let result = await Chef.find(id)
        const chef = result.rows[0]

        if(!chef) return res.send('Chef not found')

        const fileId = result.rows[0].file_id

        result = await File.find(fileId)
        file = result.rows[0]

        // file = {
        //     ...file,
        //     src: `${req.protocol}://${req.headers.host}${file.path.replace("public","")}`
        // }


        return res.render("admins/chefs/edit", {chef, file})
    },

    async put(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if(req.body[key] == "") return res.send("Por favor preencha todos os dados da receita.")
        }

        let result = await Chef.find(req.body.id)
        fileId = result.rows[0].file_id

        if(req.file) {
            result = await File.create(req.file)
            newFileId = result.rows[0].id

            await Chef.update(req.body, newFileId)
            await File.delete(fileId)
        } else {
            await Chef.update(req.body)
        }

        return res.redirect(`/admin/chefs/${req.body.id}/edit`)

    },

    delete(req, res) {
       Chef.delete(req.body.id, function() {
           return res.redirect("/admins/chefs")
       })
    }
}