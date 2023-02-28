const axios = require('axios');
const qs = require('qs');
const respond = require("../../util/sendResponse")

module.exports = async (req, res) => {
    const { registrationNumber } = req.body;
    var token = null;

    const urlParams = new URLSearchParams({
        'grant_type': 'client_credentials'
    });

    const data1 = urlParams.toString()
    var config1 = {
        method: 'post',
        url: 'https://api.getmati.com/oauth',
        headers: {
            'Authorization': 'Basic NjM2OTBlNDNiNWQ2YWIwMDFjMDRkNDlmOjVXWENSWU1MRFJQSEtXQTNDRUVCSVNDRlBKRDY2NjZT',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data1
    };

    const login_response = await axios(config1)

    token = login_response.data.access_token;

    var data = JSON.stringify({
        "registrationNumber": registrationNumber,
        "callbackUrl": "https://webhook.site/20bcfef6-ccb3-46c9-80be-1a1d9581022e"
    });

    var config = {
        method: 'post',
        url: 'https://api.getmati.com/govchecks/v1/ng/cac',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {

            let URL = `https://webhook.site/token/20bcfef6-ccb3-46c9-80be-1a1d9581022e/request/latest/raw`;

            axios.get(URL)
                .then((resp)=> {

                    if(resp.data.data.cacNumber === registrationNumber){
                        return respond(res, resp.data, 'Success', 201, true)

                    } else {
                        axios.get(URL).then((resp2)=> {
                            if(resp2.data.data.cacNumber === registrationNumber){
                                return respond(res, resp2.data, 'Success', 201, true)
        
                            }

                        })
                    }

                })
                .catch((error) => {
                    return respond(res, null, error.response)
                })
        })
        .catch(function (error) {
            
            if (error.response) {
                return respond(res, null, error.response.data)
            }
            return respond(res, null, error.response)
        });
}
