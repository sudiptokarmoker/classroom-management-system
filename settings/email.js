const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    host: process.env['SMTP_HOST'],
    port: process.env['SMTP_PORT'],
    auth: {
      user: process.env['SMPT_USER'],
      pass: process.env['SMTP_PASSWORD'],
    }
  });

  module.exports = transporter;
