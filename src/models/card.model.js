const mongoose = require("mongoose");

const CardSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        card_name: String,
        card_email: String,
        card_type: {
            type: String,
            default: "VIRTUAL",
        },
        card_id: {
            type: String,
            unique: true
        },
        idempotencyKey: {
            type: String,
            select: false
        },
        brex_owner: Object,
        limit_type: String,
        spend_limit: Object,
        spend_available: Object,
        spend_duration: {
            type: String,
            default: "MONTHLY",
        },
        reason: String, //Spend control reason
        card_details: {
            type: Object,
            select: false
        },
        billing_address: Object,
        last_four: String,
        status: String,
        card_locked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("Card", CardSchema);
