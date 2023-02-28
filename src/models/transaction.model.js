const mongoose = require("mongoose");

const TransactionsSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    txn_acct_name: {
      type: String,
      required: true
    },
    txn_acct_number: {
      type: String,
      required: true
    },
    txnRefs: {
      type: String,
      required: true,
      unique: true,
    },//Transactin reference number created using uuid
    txn_type: {
      type: String,
      default: 'DEPOSIT'
    },
    txn_remarks: String,
    txnCurrency: {
      type: String,
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    txnAmount: {
      type: Number,
      required: [true, "Please provide amount"],
    },
    settlementId: {
      type: String,
      required: false,
      unique: true
    },
    txn_status: {
      type: String,
      default: 'PENDING'
    },
    txnRate: Number,
    sessionId: String,
    sourceAccountNumber: String,
    sourceAccountName: String,
    sourceBankName: String,
    txnCoin: String,
    merchantAddress: String,
    txnNetwork: String,
    depositInDollar: Number,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Transaction", TransactionsSchema);
