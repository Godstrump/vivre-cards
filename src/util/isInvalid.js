const isFalsy = require("./isFalsy");

const isInvalid = (body) => {
    let invalidField = undefined;

    Object.entries(body).some(([key, value]) => {
        if (isFalsy(value)) {
            invalidField = key;
        }
    });

    return invalidField;
};

module.exports = isInvalid;
