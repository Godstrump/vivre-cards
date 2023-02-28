const crypto = require('crypto');
const env = require("../config/config")

const generateXAuth = () => {
    // Your secret key
    const secret = `${env.providus_client_id}:${env.providus_client_secret}`;
    
    // Create a new hmac object
    const hmac = crypto.createHmac('sha512', secret);
    
    // Generate the signature
    const signature = hmac.digest('hex');
    console.log('X-Auth signature: ', signature);
    return signature
}

module.exports = generateXAuth
