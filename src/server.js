const express = require('express')
const nunjucks = require('nunjucks')
const routes = require('./routes')
const methodOverride = require('method-override')
const session = require('./config/session')

const server = express()

server.use(session) // usar req.session na aplicação inteira
server.use( (req, res, next) => {
    res.locals.session = req.session // possibilita o uso do session no nunjucks (session.userId no layout)
    next()
})
server.use(express.urlencoded({ extended: true })) // faz o req.body funcionar
server.use(express.static('public'))
server.use(methodOverride('_method'))
server.use(routes)


server.set("view engine", "njk")

nunjucks.configure("src/app/views", {
    express: server,
    autoescape: false,
    noCache: true
})



server.listen(5000, function() {
    console.log("server is running")
})