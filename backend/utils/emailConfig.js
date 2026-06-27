const nodemailer = require('nodemailer');

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT, 10) || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
  console.warn('⚠️  Email not fully configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || 'smtp.gmail.com',
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for 587/TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Email Config Error:', error.message);
  } else {
    console.log(`✅ Email ready — ${EMAIL_USER} via ${EMAIL_HOST}:${EMAIL_PORT}`);
  }
});

module.exports = transporter;
