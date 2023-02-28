const template = require("../util/emailTemplate");
const URL = require("../util/constants").APP_URL;
const capitalize = require("../util/capitalize");

const modKey = (key) => {
    let result;
    const value = key.split("_");
    if (value?.length > 1) {
        const first = capitalize(value[0]);
        result = first + value[1];
        return result;
    }
    result = capitalize(value[0]);
    return result;
};

const complianceErrorTemplate = (name, fields) => {
    const greet = template.greeting(name);
    const p1 = template.paragraph(
        `Upon review, your compliance profile has some issues that must be resolved. They are:
        <ul style="padding-left: 17px">
            ${Object.entries(fields)
                ?.map(
                    ([key, value]) =>
                        `<li>
                    ${template.span(modKey(key))}: ${value}
                </li>`
                )
                .join("")}
        </ul>
        `
    );
    const p2 = template.paragraph(
        `Please kindly log into your account and update these on your <a href=${URL}>dashboard</a>.
        `
    );
    const p3 = template.paragraph(
        `If you have any questions, requests, or complaints, please visit our 'Contact Us' page or respond to this email.
        `
    );

    const p4 = template.paragraph(`Thank you!`);

    const message = template.message(greet, [p1, p2, p3, p4]);
    return message;
};

const complianceErrorUpdate = (name) => {
    const greet = template.greeting(name);
    const p1 = template.paragraph(
        `Your compliance profile has been updated, successfully.<br /> 
        We would contact you about the next steps within 24-48 hours.`
    );
    const p2 = template.paragraph(
        `If you have any questions, requests or complaints, please visit our 'Contact Us' page or respond to this email.
        `
    );
    const p3 = template.paragraph(`Thank you!`);
    const message = template.message(greet, [p1, p3]);
    return message;
};

module.exports = { complianceErrorTemplate, complianceErrorUpdate };
