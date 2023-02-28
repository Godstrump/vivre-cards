const Transaction = require("../../models/transaction.model");

exports.getTransaction = async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id;
    if (!userId) {
        return res
            .status(400)
            .send({
                status: false,
                message: "You do not have access to this data",
            });
    }
    if (!id) {
        return res
            .status(400)
            .send({ status: false, message: "Invalid Request" });
    }
    try {
        const data = await Transaction.findOne({ userId, _id: id });
        res.status(200).send({ status: true, data });
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.getTransactions = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res
            .status(400)
            .send({
                status: false,
                message: "You do not have access to this data",
            });
    }
    try {
        const transactions = await Transaction.find({ userId: userId });
        res.status(200).send({ status: true, data: transactions });
    } catch (err) {
        res.status(500).send(err);
    }
};
