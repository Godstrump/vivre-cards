const template = require("../util/emailTemplate");
const env = require("../config/config");

const withdrawalTemplate = (name,amount) => {
    const greet = template.greeting(name);
    const p1 = template.paragraph(`Your have just initiated a withdrawal in the sum of ${amount}`);
    // const p2 = template.div(cardDesign(name, cardNumber, expiry));
    const p4 = template.paragraph(
        `You can log into your dashboard to see your balance <a href=${env.app_url}>here</a>`
    );

    const message = template.message(greet, [p1, p4]);
    return message;
};

module.exports = withdrawalTemplate;
