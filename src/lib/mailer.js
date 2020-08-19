const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "557ae2e3018b0b",
      pass: "a3ef78b475e27f"
    }
  });