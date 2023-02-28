const mongoose = require("mongoose");

const WebhookSchema = mongoose.Schema(
    {
        name: String,
        actions: {
            type: Object,
            required: false,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("Log", WebhookSchema);
