const bcrypt = require("bcryptjs");

const genPasswordHash = async (password, saltValue = 5) => {
    let hashedPass;
    let salted;
    await bcrypt.genSalt(saltValue).then((salt) => {
        salted = salt;
    });

    await bcrypt.hash(password, salted).then((hash) => {
        hashedPass = hash;
    });
    return hashedPass;
};

const validatePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash).then((result) => {
        console.log("SUCCESS", result);
        return result;
    });
};

module.exports = {
    genHash: genPasswordHash,
    validateHash: validatePassword,
};
