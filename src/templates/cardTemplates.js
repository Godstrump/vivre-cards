const template = require("../util/emailTemplate");
const config = require("../config/config");

const cardTemplate = (name, cardNumber, expiry) => {
    const greet = template.greeting();
    const p1 = template.paragraph("Your card has been created successfully ");
    // const p2 = template.div(cardDesign(name, cardNumber, expiry));
    const p4 = template.paragraph(
        `You can log into your dashboard to see your cards <a href=${config.app_url}>here</a>`
    );

    const message = template.message(greet, [p1, p4]);
    return message;
};

module.exports = cardTemplate;
