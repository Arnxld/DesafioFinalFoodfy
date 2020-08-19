const db = require('../../config/db')
const { hash } = require('bcryptjs') // password encryption library
const fs = require('fs')
const Recipe = require('./Recipe')
const File = require('./File')

module.exports = {
    async all() {
        const results = await db.query(`SELECT * FROM users`)

        return results.rows
    },
    async findOne(filters) {
        let query = "SELECT * FROM users"

        Object.keys(filters).map(key => {
            //WHERE | OR | AND
            query = `${query}
            ${key}
            `

            Object.keys(filters[key]).map(field => {
                query = `${query} ${field} = '${filters[key][field]}'`
            })
        })

        const results = await db.query(query)

        return results.rows[0]
    },
    async create(data) {
        try {
            const query = `
            INSERT INTO users (
                name,
                email,
                password,
                is_admin
                )VALUES ($1, $2, $3, $4)
                RETURNING id, email
                `
                
                // gerando uma senha aleatória
                let randomPassword = Math.random().toString(36).slice(-5)
                const passwordHash = await hash(randomPassword, 8)
                
                const values = [
                    data.name,
                    data.email,
                    passwordHash,
                    data.is_admin || false
                ]
                
                const results = await db.query(query, values)
                
                return {
                    id: results.rows[0].id,
                    email: results.rows[0].email,
                    password: randomPassword
                }
            }
                
                catch(err) {
                    console.error(err)
                }
    },
    async update(id, fields) {
        let query = "UPDATE users SET"

        Object.keys(fields).map((key, index, array) => {
            if(index+1 < array.length) {
                query = `${query}
                    ${key} = '${fields[key]}',
                `
            } else {
                // última iteração
                query = `${query}
                    ${key} = '${fields[key]}'
                    WHERE id = ${id}
                `
            }
        })

        await db.query(query)
        return
    },
    async delete(id) {
        // pegar todas as receitas desse usuário
        let results = await db.query(`SELECT * FROM recipes WHERE user_id = $1`, [id])
        recipes = results.rows
        // console.log(recipes)

        // pegar todas as imagens das receitas
        recipeFilesRowsPromise = recipes.map(recipe => Recipe.files(recipe.id))

        let files = []
        let recipeFilesRowsResults = await Promise.all(recipeFilesRowsPromise)
        let recipesRows = recipeFilesRowsResults.map(results => results.rows)
        for(recipe of recipesRows) {
            for(file of recipe) {
                files.push(file)
            }
        }

        const filesPromise = files.map(file => File.find(file.file_id))
        filesPromiseResults = await Promise.all(filesPromise)
        files = filesPromiseResults.map(result => result.rows[0])

        // remover o usuário
        await db.query('DELETE FROM users WHERE id = $1', [id])

        // remover as imagens da pasta public e da table files (não tem cascade delete nessa tabela)
        files.map(file => {
            try{
                File.delete(file.id)
            }
            catch(err) {
                console.error(err)
            }
        })

    }
}