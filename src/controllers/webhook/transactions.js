const Transaction = require('../../models/transaction.model')
const Sheet = require("../../models/sheet.model")
const { v4: uuid } = require("../../util/uuid")
const reverseAmount = require("../../util/reverseTotal")
const Rate = require("../../models/rate.model")
const env = require("../../config/config")
const options = require("../../util/constants").configOptions
const fetch = require("../../util/fetch")
const convertToBrxAmount = require("../../util/convertToBrexAmount")
const crypto = require("crypto")
const pushEmail = require('../../util/awsSendEmail')
const depositTemplate = require("../../templates/depositTemplates")

exports.getTransactions = async (req, res) => {
    let response ={};
    const { tranRemarks, sessionId, accountNumber, transactionAmount, settlementId, sourceAccountNumber, sourceAccountName, sourceBankName, currency } = req.body
    try {
        const sheet = await Sheet.findOne({ account_number: accountNumber }).populate("owner")
        console.log('sheet', sheet);
        const xAuth = req.headers["x-auth-signature"];
        console.log('xauth', xAuth);
        console.log('sI',settlementId);
        const isXAuth = xAuth == env.providus_x_auth
        
        if (!settlementId || !accountNumber || !sheet || !isXAuth) {
            console.log('FIrst stopping...');
            response.requestSuccessful = false
            response.sessionId = sessionId;
            response.responseMessage = 'rejected transaction'
            response.responseCode = '02'
            return res.json(response)
        }

        const txn = await Transaction.findOne({ settlementId })
        if (txn) {
            response.requestSuccessful = true
            response.sessionId = sessionId;
            response.responseMessage = 'duplicate transaction'
            response.responseCode = '01'
            return res.json(response)
        }
        const rate = await Rate.findOne({ type: 'USD' })
        //Transaction USD amount
        const txnUsdAmount = reverseAmount(rate.rate, +transactionAmount, rate?.charge, rate?.fee).dollar //USD
        const latestTxn = await Transaction.findOne({ owner: sheet?.owner._id, txn_type: 'DEPOSIT', txn_status: 'RECEIVED' }).sort({_id: -1})

        //Set limit on brex
        const BREX_URL = env.brex_url
        const params = {}
        params.headers = {}
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "POST";
        const url = `${BREX_URL}/users/${sheet?.brexId}/limit`
        let userLimit
        let body;
        if (latestTxn) {
            //The new brex balance is last txn amount + txnUsdamount
            const newBrxBal = latestTxn?.depositInDollar + txnUsdAmount
            body = {
                monthly_limit: {
                    amount: newBrxBal,
                    currency: "USD"  
                }
            }
            console.log(body);
            params.body = JSON.stringify(body);
            userLimit = await (await fetch(url, params)).json()
            console.log('ul', userLimit);
        } else {
            body = {
                monthly_limit: {
                    amount: `${txnUsdAmount}00`,
                    currency: "USD"  
                }
            }
            params.body = JSON.stringify(body);
            userLimit = await (await fetch(url, params)).json()
        }

        const txnRefId = await uuid()
        const newBalance = txnUsdAmount + +sheet.balance;
        await Transaction.create({
            owner: sheet?.owner._id,
            txn_acct_name: sheet.account_name,
            txn_acct_number: sheet.account_number,
            txnRefs: txnRefId,
            txnAmount: +transactionAmount,
            txn_status: 'RECEIVED',
            txn_remarks: tranRemarks,
            balance: newBalance,
            txnCurrency: currency,
            txn_merchant: 'PROVIDUS',
            txnRate: rate.rate,
            depositInDollar: txnUsdAmount,
            sessionId,
            settlementId,
            sourceAccountNumber,
            sourceAccountName,
            sourceBankName,
        })

        sheet.balance = newBalance
        sheet.updated_at = new Date()
        await sheet.save({ validateBeforeSave: false })
        const message = depositTemplate(sheet?.owner?.last_name, txnUsdAmount)
        await pushEmail({
            email: sheet.owner.account_email,
            subject: "Vendgram Deposit",
            message: message,
            source: "account@vendgram.co",
        });

        response.requestSuccessful = true
        response.sessionId = sessionId;
        response.responseMessage = 'success'
        response.responseCode = '00'
        return res.json(response)
    } catch(err) {
        console.log('err', err);
        response.requestSuccessful = false
        response.sessionId = sessionId;
        response.responseMessage = 'rejected transaction'
        response.responseCode = '02'
        return res.json(response)
    }
}

exports.getLazerPayTxns = async (req, res) => {
    const secret = env.lazer_secret
    try {
        const  lazerHash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body), 'utf8').digest('hex');
        console.log(lazerHash);
        if (lazerHash == req.headers['x-lazerpay-signature']) {
            console.log("I'm in");
            // Retrieve the request's body
            const { 
                reference, 
                senderAddress, 
                amountPaidFiat, 
                hash, 
                network,
                merchantAddress,
                id
            } = req.body;
        
            const txn = await Transaction.findOne({ txnRefId: reference })
            const sheet = await Sheet.findOne({ owner: txn.owner }).populate("owner")
            if (txn && sheet) {
                const newBalance = sheet.balance + amountPaidFiat    
                txn.sourceAccountNumber = senderAddress
                txn.sourceAccountName = ''
                txn.sessionId = hash
                txn.merchantAddress = merchantAddress
                txn.txn_status = 'RECEIVED';
                txn.settlementId = id;
                txn.txnNetwork = network
                txn.balance = newBalance;
                txn.updated_at = new Date();
                txn.depositInDollar = amountPaidFiat

                const latestTxn = await Transaction.findOne({ owner: sheet?.owner._id, txn_type: 'DEPOSIT', txn_status: 'RECEIVED' }).sort({_id: -1})
                //Set limit on brex
                const BREX_URL = env.brex_url
                const params = {}
                params.headers = {}
                params.headers.Authorization = `Bearer ${env.brex_token}`;
                params.headers["Content-Type"] = "application/json";
                params.method = "POST";
                const url = `${BREX_URL}/users/${sheet?.brexId}/limit`
                let userLimit
                let body;
                if (latestTxn) {
                    console.log(latestTxn?.txnRate, +latestTxn.txnAmount);
                    //Former Transaction amount in dollar
                    const newBrxBal = latestTxn?.depositInDollar + amountPaidFiat
                    body = {
                        monthly_limit: {
                            amount: `${newBrxBal}00`,
                            currency: "USD"  
                        }
                    }
                    console.log(body);
                    params.body = JSON.stringify(body);
                    userLimit = await (await fetch(url, params)).json()
                    console.log('ul', userLimit);
                } else {
                    body = {
                        monthly_limit: {
                            amount: amountPaidFiat,
                            currency: "USD"  
                        }
                    }
                    params.body = JSON.stringify(body);
                    userLimit = await (await fetch(url, params)).json()
                }
            
                await txn.save({ validateBeforeSave: false })
                sheet.balance = newBalance
                sheet.updated_at = new Date()
                await sheet.save()
                
                const message = depositTemplate(sheet?.owner?.last_name, amountPaidFiat)
                await pushEmail({
                    email: sheet.owner.account_email,
                    subject: "Vendgram Deposit",
                    message: message,
                    source: "account@vendgram.co",
                });
                return res.send(200)
            }
            return res.send(400)
        }
        
    } catch (error) {
        res.send(400)
    }
}