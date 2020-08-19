const {Pool} = require("pg")

module.exports = new Pool({
    user: 'postgres',
    password: 'angel321',
    host: 'localhost',
    port: 5432,
    database: 'foodfy'
})