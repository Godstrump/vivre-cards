const mongoose = require("mongoose");

const LogSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Admin",
        },
        actions: {
            type: Object,
            required: true,
        },
        account_type: String
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("Log", LogSchema);
