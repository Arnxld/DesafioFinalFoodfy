const multer = require('multer');


// storage fala como armazenaremos o arquivo
const storage = multer.diskStorage({
    destination: (req, file, callback) => { // onde vou armazenar 
        callback(null, './public/images')
    },

    filename: (req,file,callback) => {
        // criando um nome único pro arquivo (data-nome)
        callback(null, `${Date.now().toString()}-${file.originalname}`)
    }
})


// verificar o tipo de arquivo
const fileFilter = (req, file, callback) => {
    const isAccepted = ['image/png', 'image/jpg', 'image/jpeg']
    .find(acceptedFormat => acceptedFormat == file.mimetype)

    // caso o arquivo seja aceito
    if (isAccepted) {
        return callback(null, true)
    }

    // caso não seja
    return callback(null, false)
}

module.exports = multer({
    storage,
    fileFilter
})