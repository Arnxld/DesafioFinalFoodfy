const db = require("../../config/db")

module.exports = {
    all() {
        const query = `SELECT recipes.*, chefs.name AS chef_name 
        FROM recipes
        LEFT JOIN chefs ON(recipes.chef_id = chefs.id)
        ORDER BY created_at DESC
        `
        return db.query(query)
    },
    
    find(id, callback) {
        db.query(`SELECT * FROM recipes WHERE id = $1`, [id], function(err, results) {
            if(err) throw `database error ${err}`
            callback(results.rows[0])
        })
    },
    
    recipesSearch(filter, callback) {
        return db.query(`
            SELECT recipes.*, chefs.name AS chef_name
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE recipes.title ILIKE '%${filter}%'
            ORDER BY updated_at DESC
        `)

    
    },

    chefs() {
        return db.query(`
        SELECT chefs.*, count(recipes.*) as total_recipes
        FROM chefs
        LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
        GROUP BY chefs.id
        ORDER BY total_recipes DESC`)
    },

    recipes(callback) {
        db.query(`
        SELECT recipes.*, chefs.name as chef_name 
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        `, function(err, results) {
            if(err) throw `database error ${err}`
            callback(results.rows)
        }) 
    }
}