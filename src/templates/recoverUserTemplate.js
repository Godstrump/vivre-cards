const template = require("../util/emailTemplate");

const recoveryTemplate = (url) => {
    const greet = template.greeting();
    const p1 = template.paragraph(
        "Your registration on Vendgram was successful."
    );
    const p2 = template.paragraph(
        `Having trouble logging in? <br /> Click the button below to create a new password. If you didn’t make this request please ignore this. Feel free to reply to this email with any questions or concerns`
    );
    const p4 = template.paragraph(`Password Reset: ${url}`);

    const message = template.message(greet, [p1, p2, p4]);
    return message;
};

module.exports = recoveryTemplate;
