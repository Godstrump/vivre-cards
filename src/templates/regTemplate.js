const template = require("../util/emailTemplate");

const registrationTemplate = (email, url) => {
    const greet = template.greeting();
    const p1 = template.paragraph(
        "Your registration on Vendgram was successful."
    );
    const p2 = template.paragraph(`Your sign in email is: ${email} `);
    const p3 = template.paragraph("Here is your email verification link:");
    const p4 = template.paragraph(
        `Your link is: <a href=${url}>Verify your Email`
    );

    const message = template.message(greet, [p1, p2, p3, p4]);
    return message;
};

module.exports = registrationTemplate;
