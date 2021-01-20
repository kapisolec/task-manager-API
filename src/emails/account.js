const sgMail = require('@sendgrid/mail');

const sendGridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridAPIKey);

const sendWelcomeEmail = (email, name) => {
    sgMail
        .send({
            to: email,
            from: 'kapisolec1213@gmail.com',
            subject: 'Thanks for joining me!',
            text: `Welcome to the app, ${name}! Let me know how do you get along with the app.`,
        })
        .then(console.log('Email sent!'))
        .catch((e) => console.log(e));
};

module.exports = {
    sendWelcomeEmail,
};
