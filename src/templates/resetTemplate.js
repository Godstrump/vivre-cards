const template = require("../util/emailTemplate");

const resetTemplate = () => {
    const greet = template.greeting();
    const p1 = template.paragraph("Your password has been reset successfully.");

    const message = template.message(greet, [p1]);
    return message;
};

module.exports = resetTemplate;
