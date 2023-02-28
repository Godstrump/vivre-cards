const axios = require("axios");

const fetch = async function (url, init) {
    if (url) {
        const { default: fetch } = await import("node-fetch");
        return await fetch(url, init);
    }
    const data = await axios(init);
    return data;
};

module.exports = fetch;
