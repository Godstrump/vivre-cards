const template = require("../util/emailTemplate");

const complianceCompleteTemplate = (name) => {
    const greet = template.greeting(name);
    const p1 = template.paragraph(
        "I’m Asemota Ize-Iyamu, co- founder of Vendgram and I’d like to personally thank you for signing up to our service."
    );
    const p2 = template.paragraph(
        `We established Vendgram in order to help founders and their startups to build the company of their dreams through a unified operating system that makes it easy to automate and nurture your business’ financial processes.`
    );
    const p3 = template.paragraph(
        `With Vendgram, you can:
        <ul>
            <li>Create corporate cards using Naira or USDT</li>
            <li>Manage spend and track expenses</li>
            <li>Enjoy rewards and discounts as you spen</li>
            <li>Access to a founder community</li>
        </ul>
        `
    );
    const p4 = template.paragraph(
        `I’d love to hear what you think of Vendgram and if there is anything we can improve. If you have any questions, please reply to this email. I’m always happy to help!`
    );

    const message = template.message(greet, [p1, p2, p3, p4]);
    return message;
};

module.exports = complianceCompleteTemplate;
