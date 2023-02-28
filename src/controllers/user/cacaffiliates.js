const axios = require("axios");
const qs = require("qs")
const fetch = require("../../util/fetch")
const options = require("../../util/constants").configOptions;
const respond = require("../../util/sendResponse");
const getCacToken = require("../../util/getCacToken");
const User = require("../../models/user.model");
const env = require("../../config/config")
const BusInfo = require("../../models/company-compliance.model")

//Routes to verify the Business registrationNumber
module.exports = async (req, res) => {
    const { registrationNumber } = req.body;
    let complInfo;
    const rc = `RC${registrationNumber}`;
    const bn = `BN${registrationNumber}`;

    //Verfiy the logged in user
    const userExist = User.findOne({ _id: req.user._id });
    if (!userExist) {
        respond(res, null, "User does not exist");
    }
    complInfo = await BusInfo.findOne({ cacNumber: rc })
    if (complInfo) {
        return respond(res, complInfo, 'success', 201, true)
    }
    complInfo = await BusInfo.findOne({ cacNumber: bn })
    if (complInfo) {
        return respond(res, complInfo, 'success', 201, true)
    }

    let data;
    //Delete the body from the options object
    const tokenParams = {}
    tokenParams.method = "POST";

    //config options to get access token
    data = qs.stringify({
        grant_type: "client_credentials",
    });
    tokenParams.url = env.cac_oauth_url;
    tokenParams.headers = {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${env.cac_auth}`,
    };
    tokenParams.data = data;
    const token = await getCacToken(res, tokenParams);
    console.log('hey', token, data);
    //configure options for verification
    const body = {
        registrationNumber,
        callbackUrl: `${env.cac_webhook}`,
    };
    data = JSON.stringify(body)
    params = {}
    const url = env.cac_url;
    params.headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    params.body = data;
    params.method = 'POST'
    console.log(params);
    fetch(url, options)
    .then(res => res.json())
    .then(json => console.log('tok',json))
    .catch(err => console.error('error:' + err));
    // console.log('omo',await resp.text())

    // const resp = await (await fetch(url, params)).json()

    // axios(options)
    //     .then(function (response) {
    //         let URL = `https://webhook.site/token/11d88607-6d1a-4f01-a127-ed7de8a88a94/request/latest/raw`;
    //         console.log('omo');
    //         axios
    //             .get(URL)
    //             .then((resp) => {
    //                 let msg;
    //                 // console.log(resp.data);
    //                 if (resp.data.data === null) {
    //                     msg = resp?.data?.error?.message;
    //                     return respond(res, null, msg, 404);
    //                 }
    //                 const data = resp?.data?.data;
    //                 msg = "Success";
    //                 return respond(res, data, msg, 200, true);
    //             })
    //             .catch((error) => {
    //                 return res
    //                     .status(400)
    //                     .send({ status: false, error: error.response });
    //             });
    //     })
    //     .catch(function (error) {
    //         if (error.response) {
    //             return res
    //                 .status(400)
    //                 .send({ status: false, error: error.response.data });
    //         }
    //         return res
    //             .status(400)
    //             .send({ status: false, error: error.response });
    //     });
};
