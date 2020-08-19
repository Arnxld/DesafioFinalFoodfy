const faker = require('faker')
const {hash} = require('bcryptjs')

const Chef = require('./src/app/models/Chef')
const File = require('./src/app/models/File')
const Recipe = require('./src/app/models/Recipe')
const UserModel = require('./src/app/models/UserModel')
const { random } = require('faker')

let usersIds = []
let totalUsers = 17
let totalRecipes = 10

async function createUsers() {
    try {
        const users=[]
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
        usersIds = await Promise.all(usersPromise)
    }
    catch(err) {
        console.error(err)
    }
}

createUsers()