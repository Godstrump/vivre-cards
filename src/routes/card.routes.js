const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/authenticate");
const validateUser = require("../util/validateUser")
const regist_user = require("../controllers/cards/userRegister").registerBrex;
const create_card = require("../controllers/cards/userRegister").createCard;
const lock_card = require("../controllers/cards/card").lockCard;
const terminate_card = require("../controllers/cards/card").terminateCard;
const unlock_card = require("../controllers/cards/card").unlockCard;
const fetch_cards = require("../controllers/cards/card").fetchCards;
// const get_cards_txns = require("../controllers/cards/transactions").getAllTransactions
const get_user_txns = require("../controllers/cards/transactions").getUserBrexTxns
const get_card_txns = require("../controllers/cards/transactions").getBrxCardTxns
const get_card_details = require("../controllers/cards/card").getCardDetails
const get_total_spent = require("../controllers/cards/transactions").getUserTotalSpent
const get_all_txns = require("../controllers/cards/transactions").getAllBrexTxns
const update_card = require("../controllers/cards/card").updateCard

router.post("/register-brex-user/:id", authUser, validateUser, regist_user);
router.post("/create-card", authUser, validateUser,  create_card);
router.post("/lock-card/:cardId", authUser, validateUser, lock_card);
router.post("/terminate-card/:cardId", authUser, validateUser, terminate_card);
router.post("/unlock-card/:cardId", authUser, validateUser, unlock_card);
router.get("/fetch-cards", authUser, validateUser, fetch_cards);
router.put("/update-card-limit", authUser, validateUser, update_card)

// router.get("/get-cards-transactions", authUser, validateUser, get_cards_txns)
router.get("/get-user-card-transactions", authUser, validateUser, get_user_txns)
router.get("/get-card-transactions/:id", authUser, validateUser, get_card_txns)
router.get("/get-card-details/:id", authUser, validateUser, get_card_details)
router.get("/get-user-total-spent", authUser, get_total_spent);
router.get("/get-all-txns", authUser, get_all_txns)

module.exports = router;
