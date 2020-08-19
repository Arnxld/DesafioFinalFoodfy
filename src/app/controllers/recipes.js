const Recipe = require('../models/Recipe')
const File = require('../models/File')
const UserModel = require('../models/UserModel')

module.exports = {
    async index(req,res) {
        let results = await Recipe.all()
        const recipes = results.rows
        const recipesId = recipes.map(recipe => recipe.id)
        const recipeFilesRowsPromise = recipesId.map(id => File.findForIndex(id))
        results = await Promise.all(recipeFilesRowsPromise)
        recipeFilesRows = results.map(result => result.rows[0])
        filesPromise = recipeFilesRows.map(row => File.find(row.file_id))
        results = await Promise.all(filesPromise)
        files = results.map(result => result.rows[0])
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public","")}`
        }))
        res.render("admins/recipes/index", {recipes, files})
    },

    async create(req,res) {
        let results = await Recipe.chefsSelectOptions()
        const options = results.rows

        return res.render("admins/recipes/create", {chefOptions:options})
   
    },

    async post(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if(req.body[key] == "") return res.send("Por favor preencha todos os dados da receita.")
        }

        if(req.files.length == 0) {
            return res.send("Envie ao menos uma imagem!")
        }

        req.body.user_id = req.session.userId
        let results = await Recipe.create(req.body)
        const recipeId = results.rows[0].id

        // o forEach não espera o await, então não é possível usar
        // req.files.forEach(file => {
        //     await File.create({...file})
        // })

  
        const filesPromise = req.files.map(file =>File.create(file)) // vai criar um array de promises NÃO EXECUTADAS
        const filesResults = await Promise.all(filesPromise) // vai executar o array, o retorno do db são os arquivos com os id's

        const recipeFilesPromises = filesResults.map(file => { // vai pegar cada arquivo do resultado
            const fileId = file.rows[0].id // pegando o id do arquivo

            File.createAtRecipeFiles(fileId, recipeId) // relação do arquivo com a receita
        })

        await Promise.all(recipeFilesPromises)


        return res.redirect(`/admin/recipes/${recipeId}`)
    },

    async show(req, res) {
        let result = await Recipe.find(req.params.id)
        recipe = result.rows[0]

        if(!recipe) return res.send("recipe not found")

        // get images
        let results = await Recipe.files(recipe.id)
        let recipe_files = results.rows
        let filesId = recipe_files.map(row => row.file_id)

        let filesPromise = filesId.map(id => File.find(id))
        results = await Promise.all(filesPromise)

        const files = results.map(result => ({
            ...result.rows[0],
            src: `${req.protocol}://${req.headers.host}${result.rows[0].path.replace("public","")}`
        }))

        return res.render('admins/recipes/show', {recipe, files})

    },

    async edit(req,res) {
        try {

            let results = await Recipe.find(req.params.id)
            const recipe = results.rows[0]

            if(!recipe) return res.send("Receita não encontrada")

            //get chefOptions
            results = await Recipe.chefsSelectOptions()
            options = results.rows

            //get images
            results = await Recipe.files(recipe.id) 
            let filesId = results.rows // seleciona os campos do db com o id da receita
            filesId = filesId.map(file => file.file_id) // pego o id dos arquivos da receita

            let filesPromise = filesId.map(id => File.find(id)) // array de promessas para pegar os arquivos
            results = await Promise.all(filesPromise) 

            let files = results.map(result => ({ // parenteses encapsulando para fazer um objeto
                ...result.rows[0], // aqui eu espalho UM arquivo
                // caminho da imagem no browser (colocar no buscador do browser) ex: localhost:3000/images/nome
                src: `${req.protocol}://${req.headers.host}${result.rows[0].path.replace("public","")}`
            }))


            return res.render('admins/recipes/edit', {recipe, chefOptions:options, files})
        
        }
        catch(err) {
            console.error()
        }
    },

    async put(req,res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            // necessário tirar o removed_files porque se não remover uma foto, constará como vazio
            if(req.body[key] == "" && key != "removed_files") return res.send("Por favor preencha todos os dados da receita.")
        }

        // criar as imagens novas recebidas na edição
        if(req.files.length != 0) {
            const newFilesPromise = req.files.map(file => File.create(file))
            let results = await Promise.all(newFilesPromise)

            const recipeFilesPromises = results.map(file => {
                const fileId = file.rows[0].id
                File.createAtRecipeFiles(fileId, req.body.id)
            })
            await Promise.all(recipeFilesPromises)
            
        }


        // deletar as fotos no banco de dados
        if(req.body.removed_files) {
            // quebra a string nas vírgulas, gerando um array ["1","2","3",""]
            const removedFiles = req.body.removed_files.split(",")
            // retirar o ultimo index vazio
            const lastIndex = removedFiles.length - 1
            removedFiles.splice(lastIndex, 1) // [1,2,3]

            // deletar a foto do banco de dados
            const removedFilesPromise = removedFiles.map(id => {
                File.deleteAtRecipeFiles(id)
                File.delete(id)
            })
            await Promise.all(removedFilesPromise)
        }


        await Recipe.update(req.body)


        return res.redirect(`/admin/recipes/${req.body.id}`)

    },

    delete(req,res) {
        Recipe.delete(req.body.id,function() {
            return res.redirect("/admin/recipes")
        })
    }


}

