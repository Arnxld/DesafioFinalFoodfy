const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "daac6e73350f4c",
      pass: "b3117a6e3a6a87"
    }
  });