const Txn = require("../../models/transaction.model");
const Sheet = require("../../models/sheet.model")
const { v4: uuid } = require("uuid")
const respond = require("../../util/sendResponse")
const withdrawalTemplate = require("../../templates/withdrawalTemplate")
const pushEmail = require('../../util/awsSendEmail')

exports.initiateWithdrawals = async (req, res) => {
    const user = req.user
    const { amount, acct_name, acct_num } = req.body;

    try {
        const txnRef = uuid(0)
        const actualAmount = +amount
        const sheet = await Sheet.findOne({ owner: user._id}).populate("owner")
        const balance = sheet.balance - +amount
        const txn =  await Txn.create({
            owner: user?._id,
            txn_acct_name: acct_name,
            txn_acct_number: acct_num,
            txnRefs: txnRef,
            txnAmount: actualAmount,
            txnCurrency: 'NGN',
            txn_type: 'WITHDRAWAL',
            balance
        })

        sheet.balance = balance
        await sheet.save();

        const message = withdrawalTemplate(sheet?.owner?.last_name, amount)
        await pushEmail({
            email: sheet.owner.account_email,
            subject: "Vendgram Withdrawal",
            message: message,
            source: "account@vendgram.co",
        });
        return respond(res, txn, 'Success', 200, true)
        
    } catch (error) {
        return respond(res, null, error.message)
    }
}
