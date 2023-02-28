const axios = require("axios");
const config = require("../config/config");

const URL = config.aws_send_email;

const awsSendEmail = async (params) => {
    console.log(config.aws_send_email);
    try {
        await axios.post(URL, params);
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = awsSendEmail;
