const express = require("express");
const { route } = require("./user.routes");
const router = express.Router();
const card_webhook = require("../controllers/webhook/card-webhook").getExpenseWbhk
const get_transactions = require("../controllers/webhook/transactions").getTransactions
const get_parsios = require("../controllers/webhook/index").parsio
const get_lazerpay_txns = require("../controllers/webhook/transactions").getLazerPayTxns
const get_cac_info = require("../controllers/webhook/index").cacWebhook

router.post("/get-expense-payment", card_webhook)
router.post("/get-providus-transactions", get_transactions)
router.post("/get-parsios-email", express.raw({type: 'application/json'}), get_parsios);
router.post("/get-lazerpay-transactions", get_lazerpay_txns)
router.post("/get-cac-infos", get_cac_info)

module.exports = router;
