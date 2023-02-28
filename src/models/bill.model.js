const mongoose = require("mongoose");

const BillsSchema = mongoose.Schema(
    {
        Bill_Name: {
            type: String,
            required: true,
            unique: true,
        },
        Bill_Type: {
            type: String,
            required: true,
        },
        Bill_Amount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("Bills", BillsSchema);
