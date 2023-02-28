const axios = require("axios");
const qs = require("qs");
const options = require("../../util/constants").configOptions;
const respond = require("../../util/sendResponse");
const getCacToken = require("../../util/getCacToken");
const User = require("../../models/user.model");

//Routes to verify the Business bvn
module.exports = async (req, res) => {
    const { docNumber, firstName, lastName } = req.body;

    // Verfiy the logged in user
    const userExist = User.findOne({ _id: req.user._id });
    if (!userExist) {
        respond(res, null, "User does not exist");
    }
    let data;
    //Delete the body from the options object
    delete options.body;
    options.method = "POST";

    //config options to get access token
    const urlParams = new URLSearchParams({
        grant_type: "client_credentials",
    });
    data = urlParams.toString()
    options.url = "https://api.getmati.com/oauth";
    options.headers = {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${process.env.CAC_AUTH}`,
    };
    options.data = data;
    const token = await getCacToken(res, options);

    //configure options for verification
    data = JSON.stringify({
        documentNumber: docNumber,
        firstName: firstName,
        lastName: lastName,
        callbackUrl:
            "https://webhook.site/11d88607-6d1a-4f01-a127-ed7de8a88a94",
    });
    options.url = "https://api.getmati.com/govchecks/v1/ng/bvn";
    options.headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    options.data = data;

    axios(options)
        .then(function (response) {
            let URL = `https://webhook.site/token/11d88607-6d1a-4f01-a127-ed7de8a88a94/request/latest/raw`;

            console.log("res", response);

            axios
                .get(URL)
                .then((resp) => {
                    let msg;
                    console.log("data", resp.data);
                    if (resp.data.data === null) {
                        msg = resp?.data?.error?.message;
                        return respond(res, null, msg, 404);
                    }
                    const data = resp?.data?.data;
                    msg = "Success";
                    return respond(res, data, msg, 200, true);
                })
                .catch((error) => {
                    return res
                        .status(400)
                        .send({ status: false, error: error.response });
                });
        })
        .catch(function (error) {
            if (error.response) {
                return res
                    .status(400)
                    .send({ status: false, error: error.response.data });
            }
            return res
                .status(400)
                .send({ status: false, error: error.response });
        });
};
