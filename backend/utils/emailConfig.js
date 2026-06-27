const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // process.env se value lo, agar na mile toh hardcoded string use karo (sirf debugging ke liye)
    host: process.env.EMAIL_HOST || "mail.softwaregiant.in", 
    port: process.env.EMAIL_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false 
    }
});

// Yeh debug line aapko terminal mein batayegi ki kaunsa host use ho raha hai
console.log("Attempting to connect to Email Host:", process.env.EMAIL_HOST);

transporter.verify((error, success) => {
    if (error) {
        console.log("Email Config Error:", error);
    } else {
        console.log("Email Server is ready to take our messages");
    }
});

module.exports = transporter;