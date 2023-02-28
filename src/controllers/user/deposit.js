const User = require("../../models/user.model");
const Rate = require('../../models/rate.model')
const Transaction = require("../../models/transaction.model");
const Sheet = require("../../models/sheet.model")
const Company = require("../../models/company.model")
const fetch = require('../../util/fetch')
const options = require('../../util/constants').configOptions
const env = require("../../config/config");
const respond = require("../../util/sendResponse");
const { FEE_PERCENT, FLAT_FEE_USD } = require('../../util/constants')
const calcTotal = require('../../util/calcTotal')
const { v4: uuid} = require("uuid")
const LazerPay = require('lazerpay-node-sdk').default;

exports.getDeposits = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).send({
            status: false,
            message: "You do not have access to this data",
        });
    }
    try {
        const deposits = await Transaction.find({
            userId,
            transaction_type: "deposit",
        });
        res.status(200).send({ status: true, deposits });
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.getRate = async (req, res) => {
    try {
        const type = req.params.type;
    
        const rate = await Rate.findOne({ type: type})
        if (rate) {
            return respond(res, rate, 'Request successful', 201, true)

        }
        return respond(res, rate, 'Rate not found', 404)
    } catch (error) {
        respond(res, null, error.message)
    }
}

exports.initDeposit = async (req, res) => {
    try {
        const {amount} = req.query;
        const type = req.params.type?.toUpperCase()

        if (!amount) return respond(res, null, 'Amount can not be null')
    
        const doc = await Rate.findOne({ type })
        const total = calcTotal(doc?.rate, amount, doc?.charge, doc?.fee)

        const data = {
            pay: total.naira,
            fee: `${FEE_PERCENT * 100}%`,
            flatFee: `$${FLAT_FEE_USD}.00`,
            rate: doc?.rate
        }
        
        respond(res, data, 'Request successful', 201, true)
        
    } catch (error) {
        respond(res, null, error.message)
    }

}

exports.createVirtualAccount = async (req, res) => {  
    try {
        const PROVIDUS_URL = env.providus_va_url
        const { amount, currency } = req.body;
        // const owner = req.user._id;
        const owner = req.params.id

        //find transactions
        const user = await User.findOne({ _id: owner })
        const usersname = `${user?.first_name}`
        const txAcctName = {account_name: `VG-${usersname}${owner?.slice(0,owner?.length/4)}`};
        
        const params = {}
        params.headers = options.headers
        params.headers["Content-Type"] = 'application/json'
        params.headers["X-Auth-Signature"] = env.providus_x_auth
        params.headers["Client-Id"]=env.providus_client_id
        params.body = JSON.stringify(txAcctName)
        params.method = 'POST'

        const vacct = await (await fetch(PROVIDUS_URL, params)).json()
        console.log(vacct);
        console.log(params);

        if (!vacct.requestSuccessful) {
            return respond(res, null, vacct.responseMessage, 400, false)
        }

        const txnRefId = await uuid()
        const newTx = await Transaction.create({
            owner,
            txn_acct_name: user.account_name,
            txn_acct_number: user.account_number,
            txnRefs: txnRefId,
            txnAmount: amount,
            txnCurrency: currency
        })
        console.log(newTx);
        const { account_name, account_number } = vacct
        const data = {
            account_number,
            account_name,
            txType: 'PENDING'
        }
        respond(res, data, vacct.responseMessage, 200, true)

        
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};

exports.deposit = async (req, res) => {
    try {
        const { amount, type } = req.body;
        const owner = req.user._id;
        // const owner = req.params.id

        if (!amount) return respond(res, null, 'Amount can not be null')
    
        const doc = await Rate.findOne({ type })
        const total = calcTotal(doc?.rate, amount, doc?.charge, doc?.fee)

        //find transactions
        const user = await User.findOne({ _id: owner })

        // const txnRefId = await uuid()

        // const txn = await Transaction.create({
        //     owner,
        //     txn_acct_name: user.account_name,
        //     txn_acct_number: user.account_number,
        //     txnRefs: txnRefId,
        //     txnAmount: amount,
        //     txnCurrency: currency
        // })
        console.log(txn);
        const data = {
            account_name: user?.account_name,
            account_number: user?.account_number,
            initAmount: amount,
            naira: total.naira,
        }
        respond(res, data, 'Success', 201, true)
        
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
}

exports.fundWithLazerPay = async (req, res) => {
    try {
        const LAZER_PUBLIC_KEY = env.lazer_public_key;
        const LAZER_SECRET_KEY = env.lazer_secret
        const lazerpay = new LazerPay(LAZER_PUBLIC_KEY, LAZER_SECRET_KEY);
        
        const { amount, remarks } = req.body
        if (!amount) {
            return respond(res, null, 'Amount can not be empty')
        }
        const user = req.user;
        const txnRefId = await uuid()
        
        const sheet = await Sheet.findOne({ owner: user?._id })
        const currency = await Rate.findOne({ type: 'USD' })
        const txnAmount = +amount

        await Transaction.create({
            owner: sheet?.owner,
            txn_acct_name: sheet.account_name,
            txn_acct_number: sheet.account_number,
            txnRefs: txnRefId,
            txnAmount,
            txn_remarks: remarks ?? '',
            txnCurrency: 'USD',
            txnCoin: 'USDT',
            txn_merchant: 'LAZER',
            txnRate: currency.rate,
        })
        
        const transaction_payload = {
            reference: txnRefId, // Replace with a reference you generated
            customer_name: `${user?.first_name} ${user?.last_name}`,
            customer_email: user?.account_email,
            coin: 'USDT',
            currency: 'USD',
            amount: `${amount}`,
            acceptPartialPayment: false // By default it's false
        };
        
        const response = await lazerpay.Payment.initializePayment(transaction_payload);
        // console.log('lsp',response)

        respond(res, response, 'Success', 201, true)
    } catch (error) {
        console.log('error',error.message);
        respond(res, null, error.message, 500)
    }
}

exports.getLazerPayAddress = async (req, res) => {
    try {
        const coin = 'USDT'
        const token = env.lazer_secret
        const URL = `${env.lazerpay_url}/?coin=${coin}`
        const params = {}
        params.method = 'GET';
        params.headers = {};
        params.headers["Content-Type"] = 'application/json';
        params.headers["Authorization"] = `Bearer ${token}`

        const payload = await (await fetch(URL, params)).json()
        respond(res, payload, 'Success', 201, true)
    } catch (error) {
        console.log(error);
        respond(res, null, error.message, error.status)
    }
}

exports.createReservedAccount = async (req, res) => {  
    try {
        const PROVIDUS_URL = env.providus_ra_url
        // const owner = req.user._id;
        const owner = req.params.id

        //find transactions
        const user = await Company.findOne({ owner })
        const username = `${user?.company_name}`
        const acctName = {account_name: `${username}`, bvn: ''};
        
        const params = {}
        params.headers = options.headers
        params.headers["Content-Type"] = 'application/json'
        params.headers["X-Auth-Signature"] = env.providus_x_auth
        params.headers["Client-Id"]=env.providus_client_id
        params.body = JSON.stringify(acctName)
        params.method = 'POST'

        const racct = await (await fetch(PROVIDUS_URL, params)).json()
        console.log(racct);
        console.log(params);

        if (!racct.requestSuccessful) {
            return respond(res, null, racct.responseMessage, 400, false)
        }

        const { account_name, account_number } = racct
        
        await Sheet.create({ 
            owner, 
            account_number,
            account_name,
            brexId: "cuuser_clc0t4m4p00010pjxbf29red1"
        })
        await User.findOneAndUpdate({ _id: owner}, { account_number, account_name}, { new: true })
        const data = {
            account_number,
            account_name,
        }
        respond(res, data, racct.responseMessage, 200, true)
    } catch (err) {
        respond(res, null, err.message, 500)
    }
};


exports.refreshBalance = async (req, res) => {
    const userId = req.user._id
    try {
        const sheet = await Sheet.findOne({ owner: userId})
        respond(res, sheet.balance, 'Success', 201, true);
    } catch (error) {
        respond(res, null, error.message)
    }
}