const template = require("../util/emailTemplate");
const env = require("../config/config");

const otpTemplate = (code) => {
    const greet = template.greeting();
    const p1 = template.paragraph(`Your otp code is ${code}`);
    const message = template.message(greet, [p1]);
    return message;
};

module.exports = otpTemplate;
