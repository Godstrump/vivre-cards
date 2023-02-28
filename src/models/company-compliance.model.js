const mongoose = require("mongoose");

const CompanyComplianceSchema = mongoose.Schema(
    {
        id: {
            type: String,
            // required: true
        },
        type: {
            type: String,
            // required: true,
        },
        companyName: {
            type: String,
            // required: true,
        },
        cacNumber: {
            type: String,
            // required: true,
        },
        status: {
            type: String,
            // required: true
        },
        companyAddress: {
            type: String,
            // required: true
        },
        companyEmail: {
            type: String,
            // required: true
        },
        registrationDate: {
            type: String,
            // required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("CompanyCompliance", CompanyComplianceSchema);
