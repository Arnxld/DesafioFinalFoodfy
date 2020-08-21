const faker = require('faker')
const {hash} = require('bcryptjs')

const Chef = require('./src/app/models/Chef')
const File = require('./src/app/models/File')
const Recipe = require('./src/app/models/Recipe')
const UserModel = require('./src/app/models/UserModel')
const { random } = require('faker')

let usersIds = []
let totalUsers = 5
let totalRecipes = 10
let totalChefs = 3

async function createUsers() {
    try {
        let users=[]
        const password = await hash('1111', 8)

        while (users.length < totalUsers) {
            users.push({
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password,
                is_admin: random.boolean()
            })
        }

        const usersPromise = users.map(user => UserModel.create(user))
        createdUsers = await Promise.all(usersPromise)
        usersIds = createdUsers.map(user => user.id)
    }
    catch(err) {
        console.error(err)
    }
}

async function createChefs() {
    let files = []
    let chefs = []

    while (files.length < totalChefs) {
        files.push({
            filename: faker.image.image(),
            path: `public/images/chefPlaceholder.png`
        })
    }

    filesPromise = files.map(file => File.create(file))
    filesIdsResults = await Promise.all(filesPromise)
    filesIds = filesIdsResults.map(result => result.rows[0].id)

    while(chefs.length < totalChefs) {
        chefs.push({
            name: faker.name.firstName(),
        })
    }

    chefsPromises = chefs.map(chef => {
        file = filesIds[Math.ceil(Math.random() * filesIds.length - 1)]
        fileIndex = filesIds.indexOf(file)
        Chef.create(chef, file)
        filesIds.splice(fileIndex, 1)
    })

    await Promise.all(chefsPromises)
}

async function createRecipes() {
    let recipes = []
    const totalFiles = 20
    let files = []

    while (files.length < totalFiles) {
        files.push({
            filename: faker.image.image(),
            path: `public/images/recipePlaceholder.png`
        })
    }

    filesPromise = files.map(file => File.create(file))
    filesIdsResults = await Promise.all(filesPromise)
    filesIds = filesIdsResults.map(result => result.rows[0].id)



    while(recipes.length < totalRecipes) {
        recipes.push({
            chef: Math.ceil(Math.random() * totalChefs),
            title: faker.name.title(),
            ingredients: [faker.random.word(), faker.random.word()],
            preparation: [faker.random.words(), faker.random.words()],
            information: faker.lorem.paragraph(Math.ceil(Math.random() * 10)),
            user_id: Math.ceil(Math.random() * totalUsers)
        })
    } // 10 receitas

    const recipesPromises = recipes.map(recipe => Recipe.create(recipe))
    const recipesResults = await Promise.all(recipesPromises)
    const recipesIds = recipesResults.map(result => result.rows[0].id) // 10 ids de receitas

    for()

}

async function init() {
    await createUsers()
    await createChefs()
    await createRecipes()
}

init()