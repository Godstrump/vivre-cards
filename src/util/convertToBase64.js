// const fs = require("fs").promises;
const fs = require("fs");

const toBase64 = (path) => {
    return fs.readFileSync(path, "base64");
};

module.exports = toBase64;
