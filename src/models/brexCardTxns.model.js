const mongoose = require("mongoose");

const BrexCardTxnsSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId | String,
        },
        txnId: {
            type: String,
            required: true,
            unique: true,
            select: false
        },
        card_id: {
            type: String,
            required: true,
        },
        txnDesc: String,
        amount: {
            type: Object,
            required: true
        },
        txnType: {
            type: String,
            required: true
        },
        merchant: String | Object
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("BrexCardTxn", BrexCardTxnsSchema);
