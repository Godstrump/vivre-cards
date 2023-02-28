const template = require("../util/emailTemplate");

const verifiedEmail = () => {
    const greet = template.greeting();
    const p1 = template.paragraph("Your email has been successfully verified");

    const message = template.message(greet, [p1]);
    return message;
};

module.exports = verifiedEmail;
