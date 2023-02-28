const User = require("../../models/user.model");
const Transaction = require("../../models/transaction.model");
const Bill = require("../../models/bill.model");
const sendEmail = require("../../util/sendEmail");

exports.getBillpayments = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).send({
            status: false,
            message: "You do not have right to access this data",
        });
    }
    try {
        const data = await Transaction.find({
            userId,
            transaction_type: "bill_payment",
        });
        res.status(200).send({ status: true, data });
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.payBill = async (req, res) => {
    const { amount, bill } = req.body;
    const userId = req.user._id;
    const userAccount = req.user.account;

    // validate entries
    if (!amount || !bill) {
        return res.status(400).send({
            status: false,
            message: "Please enter amount and bill type",
        });
    }

    try {
        // check to know if the account numbers entered are valid
        const billPayer = await User.findOne({
            _id: userId,
            account_number: userAccount,
        });

        const billPay = await Bill.findOne({ _id: bill });

        if (!billPay) {
            return res
                .status(401)
                .send({ status: false, message: "Bill type not found" });
        }

        if (!billPayer) {
            return res.status(401).send({
                status: false,
                message: "Bill Payer account not found",
            });
        }

        // check if amount is bill amount
        if (amount === billPay.Bill_Amount) {
            return res.status(401).send({
                status: false,
                message: "Invalid amount. Bill amount ",
            });
        }

        // check if bill payer account is disabled
        if (billPayer.is_activated === true) {
            return res
                .status(401)
                .send({ status: false, message: "Account is disabled." });
        }

        // check if bill payer has enough balance
        if (amount > billPayer.account_balance) {
            return res
                .status(401)
                .send({ status: false, message: "Insufficient balance" });
        }

        // update the bill payer balance
        const oldBalance = parseFloat(billPayer.account_balance);
        const intAmount = parseFloat(amount);
        const newBalance = oldBalance - intAmount;

        const updatedBillPayer = await User.findOneAndUpdate(
            { _id: userId, account_number: userAccount },
            { account_balance: newBalance },
            { new: true }
        );

        // create a failure transaction
        if (!updatedBillPayer) {
            const transaction1 = new Transaction({
                userId: billPayer._id,
                sent_to: bill,
                amount: amount,
                transaction_type: "bill_payment",
                transaction_status: "failed",
            });

            await transaction1.save();

            return res.status(401).send({
                status: false,
                message: "Bill Payment failed. Please try again",
            });
        }

        // create a success transaction
        const transaction = new Transaction({
            userId: billPayer._id,
            sent_to: bill,
            amount: amount,
            transaction_type: "bill_payment",
            transaction_status: "success",
        });

        await transaction.save();

        const message1 = `<h2>Dear Customer,</h2>
                        <p>You have successfully paid a bill ${billPay.Bill_Name}.<br>
                        Your new account balance is ${newBalance}.</p>`;

        await sendEmail({
            email: sender.account_email,
            subject: "Bill Payment Notification",
            message: message1,
        });

        // send the response
        res.status(200).send({
            status: true,
            message: "Bill Payment successful",
        });
    } catch (err) {
        res.status(500).send(err);
    }
};
