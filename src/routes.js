const express = require("express")
const routes = express.Router()
const multer = require("./app/middlewares/multer") // o multer permite o envio de dados ao back-end

const users = require("./app/controllers/users")
const recipes = require("./app/controllers/recipes")
const chefs = require("./app/controllers/chefs")
const SessionController = require("./app/controllers/SessionController")
const ProfileController = require("./app/controllers/ProfileController")
const UserController = require("./app/controllers/UserController")

const UserValidator = require('./app/validators/user')
const ProfileValidator = require('./app/validators/profile')
const SessionValidator = require('./app/validators/session')

const { onlyUsers, isAdmin, isLogged, onlyOwnUsers } = require('./app/middlewares/session')

// área desbloqueada do site

routes.get('/', users.home) // página home do site

routes.get('/about', users.about) // sobre o foodfy

routes.get('/search', users.search) // busca por receitas

routes.get('/recipes', users.recipes) // listagem de receitas

routes.get('/recipes/:id', users.show) // mostra os dados de uma receita

routes.get('/chefs', users.chefs)



// admin de recipes
routes.get('/admin/recipes', onlyUsers, recipes.index) // mostra a lista de receitas no admin

routes.get('/admin/recipes/create', onlyUsers, recipes.create) // mostra o formulário de criação de uma receita

// recebendo um Array de arquivos no campo "photos" limitado a 5 arquivos
routes.post('/admin/recipes', onlyUsers, multer.array("photos", 5), recipes.post) // cadastra uma nova receita

routes.get('/admin/recipes/:id', onlyUsers, recipes.show) // mostra os dados de uma receita

routes.get('/admin/recipes/:id/edit', onlyOwnUsers, recipes.edit) // mostra o formulário de edição de uma receita

routes.put('/admin/recipes', onlyUsers,  multer.array("photos", 5), recipes.put)

routes.delete('/admin/recipes', onlyUsers, recipes.delete)



// admin de chefs
routes.get('/admin/chefs', onlyUsers, chefs.index)

routes.get('/admin/chefs/create', isAdmin, chefs.create) // mostra o formulário de cadastro de um chefs

routes.post('/admin/chefs', isAdmin, multer.single('avatar'), chefs.post) // cadastra o chef

routes.get('/admin/chefs/:id', onlyUsers, chefs.show) // mostra o chef

routes.get('/admin/chefs/:id/edit', isAdmin, chefs.edit) // formulário de edição

routes.put('/admin/chefs', isAdmin, multer.single('avatar'), chefs.put) // edita o chefe

routes.delete('/admin/chefs', isAdmin, chefs.delete) // deleta o chefe



// login/logout SessionController
routes.get('/login', isLogged, SessionController.loginForm)
routes.post('/login',SessionValidator.login, SessionController.login)
routes.post('/logout', SessionController.logout)

// reset password
routes.get('/forgot-password', SessionController.forgotForm)
routes.get('/password-reset', SessionController.resetForm)
routes.post('/forgot-password', SessionValidator.forgot, SessionController.forgot)
routes.post('/password-reset', SessionValidator.reset, SessionController.reset)


// Rotas que o administrador irá acessar para gerenciar usuários

routes.get('/admin/register', isAdmin, UserController.registerForm) // Mostra o formulário de registro de um usuário
routes.get('/admin/users', isAdmin, UserController.list) // Mostrar a lista de usuários cadastrados
routes.get('/admin/users/:id', isAdmin, UserController.updateForm) // Mostrar a lista de usuários cadastrados
routes.post('/admin/users', isAdmin, UserValidator.post, UserController.post) // Cadastrar um usuário
routes.put('/admin/users', isAdmin, UserController.put) // Editar um usuário
routes.delete('/admin/users', isAdmin, UserValidator.adminCannotDeleteOwnAccount, UserController.delete) // Deletar um usuário


// Rotas de perfil de um usuário
routes.get('/admin/profile', onlyUsers, ProfileValidator.index, ProfileController.index) // mostra os dados do usuário logado
routes.put('/admin/profile', onlyUsers, ProfileValidator.update, ProfileController.put) // update do usuário logado


module.exports = routes