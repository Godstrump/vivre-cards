const crypto = require('crypto');

const validateLazerPay = async (req, res, next) => {
    //validate event
    var hash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body), 'utf8').digest('hex');

    if (hash == req.headers['x-lazerpay-signature']) {
        return next()
    }
    
};

module.exports = validateLazerPay;
