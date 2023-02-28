const User = require("../../models/user.model");
const Transaction = require("../../models/transaction.model");
const sendEmail = require("../../util/sendEmail");

exports.getTransfers = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).send({
            status: false,
            message: "You do not have access to this data",
        });
    }
    try {
        const transfers = await Transaction.find({
            userId,
            transaction_type: "transfer",
        });
        res.status(200).send({ status: true, transfers });
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.transfer = async (req, res) => {
    const { account, amount, receiver } = req.body;
    const userId = req.user._id;
    const userAccount = req.user.account;

    // validate entries
    if (!account || !amount || !receiver) {
        return res.status(400).send({
            status: false,
            message: "Please enter account, amount and receiver",
        });
    }

    // validate account and user match
    if (account !== userAccount) {
        return res
            .status(400)
            .send({ status: false, message: "Transfer account error" });
    }

    // validate receiver and sender match
    if (userAccount === receiver) {
        return res
            .status(400)
            .send({ status: false, message: "Receiver account error" });
    }

    try {
        // check to know if the account numbers entered are valid
        const sender = await User.findOne({
            _id: userId,
            account_number: userAccount,
        });

        const receiverUser = await User.findOne({ account_number: receiver });

        if (!sender) {
            return res
                .status(401)
                .send({ status: false, message: "Sender account not found" });
        }

        if (!receiverUser) {
            return res
                .status(401)
                .send({ status: false, message: "Receiver account not found" });
        }

        // check if amount is valid
        if (amount < 0) {
            return res.status(401).send({
                status: false,
                message: "Invalid amount. Please enter a valid amount.",
            });
        }

        // check if senders account is disabled
        if (sender.is_activated === true) {
            return res
                .status(401)
                .send({ status: false, message: "Account is disabled." });
        }

        // check if sender has enough balance
        if (amount > sender.account_balance) {
            return res
                .status(401)
                .send({ status: false, message: "Insufficient balance" });
        }

        // update the sender balance
        const oldBalance = parseFloat(sender.account_balance);
        const intAmount = parseFloat(amount);
        const newBalance = oldBalance - intAmount;

        const updatedSender = await User.findOneAndUpdate(
            { _id: userId, account_number: userAccount },
            { account_balance: newBalance },
            { new: true }
        );

        // create a failure transaction
        if (!updatedSender) {
            const transaction1 = new Transaction({
                userId: sender._id,
                sent_to: receiver,
                amount: amount,
                transaction_type: "transfer",
                transaction_status: "failed",
            });

            await transaction1.save();

            return res.status(401).send({
                status: false,
                message: "Transaction failed. Please try again",
            });
        }

        // create a success transaction
        const transaction = new Transaction({
            userId: sender._id,
            sent_to: receiver,
            amount: amount,
            transaction_type: "transfer",
            transaction_status: "success",
        });

        await transaction.save();

        const message1 = `<h2>Dear Customer,</h2>
                        <p>You transferred ${amount} to ${receiverUser.first_name} ${receiverUser.last_name}. <br>
                        Your new account balance is ${newBalance}.</p>`;

        await sendEmail({
            email: sender.account_email,
            subject: "Transfer Successful",
            message: message1,
        });

        // update the receiver balance
        const oldBalanceReceiver = parseFloat(receiverUser.account_balance);
        const newBalanceReceiver = intAmount + oldBalanceReceiver;

        const updatedReceiver = await User.findOneAndUpdate(
            { account_number: receiver },
            { account_balance: newBalanceReceiver },
            { new: true }
        );

        // create a success transaction for the receiver
        const transactionReceiver = new Transaction({
            userId: receiverUser._id,
            received_from: userAccount,
            amount: amount,
            transaction_type: "transfer",
            transaction_status: "success",
        });

        await transactionReceiver.save();

        // send the response
        res.status(200).send({ status: true, message: "Transfer successful" });

        const message2 = `<h2>Dear Customer,</h2>
                        <p>You have received ${amount} from ${sender.first_name} ${sender.last_name}. <br>
                        Your new account balance is ${updatedReceiver.account_balance}.</p>`;

        await sendEmail({
            email: receiverUser.account_email,
            subject: "Transaction Notification",
            message: message2,
        });
    } catch (err) {
        res.status(500).send(err);
    }
};
