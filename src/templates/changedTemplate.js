const template = require("../util/emailTemplate");

const changePasswordTemplate = () => {
    const greet = template.greeting();
    const p1 = template.paragraph("Your password has been changed successfully.");

    const message = template.message(greet, [p1]);
    return message;
};

module.exports = changePasswordTemplate;
