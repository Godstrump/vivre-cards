const mongoose = require("mongoose");

const RateSchema = mongoose.Schema(
    {
        rate: Number,
        type: String,
        charge: Number,
        fee: Number
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("Rate", RateSchema);
