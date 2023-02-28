const Bill = require("../../models/bill.model");

exports.createBill = async (req, res) => {
    const { name, type, amount } = req.body;

    if (!name || !type || !amount) {
        return res
            .status(400)
            .send({
                status: false,
                message: "Please enter name, type and amount",
            });
    }

    const bill = await Bill.findOne({ Bill_Name: name, Bill_Type: type });

    if (bill) {
        return res
            .status(400)
            .send({ status: false, message: "This bill already exists" });
    }

    try {
        const newBill = new Bill({
            Bill_Name: name,
            Bill_Type: type,
            Bill_Amount: amount,
        });

        const bill = await newBill.save();

        if (bill) {
            res.status(200).send({
                status: true,
                message: "Bill Created Successful",
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.getBills = async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        return res
            .status(400)
            .send({
                status: false,
                message: "You must be logged in to access this route",
            });
    }

    try {
        const bills = await Bill.find().sort({ _id: "desc" });

        res.status(200).send({ status: true, bills });
    } catch (err) {
        res.status(500).send(err);
    }
};
