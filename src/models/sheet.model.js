const mongoose = require("mongoose");

const SheetSchema = mongoose.Schema(
  {
    account_number: {
      type: String,
      unique: true
    },
    account_name: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    brexId: {
      type: String,
      unique: true
    },
    balance: {
        type: Number,
        default: 0
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Sheet", SheetSchema);
