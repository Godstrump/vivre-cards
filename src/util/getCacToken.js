const axios = require("axios");
const respond = require("./sendResponse");

const getCacToken = async (res, options) => {
    try {
        const token = await axios(options);
        return token.data.access_token;
    } catch (error) {
        respond(res, null, error.message);
    }
};

module.exports = getCacToken;
