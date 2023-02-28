const express = require("express");
const router = express.Router();
const { authAdmin } = require("../middlewares/authenticate");

// Require controller modules
const admin_login = require("../controllers/admin/admin").adminLogin;
const admin_logout = require("../controllers/admin/admin").adminLogout;
const create_admin = require("../controllers/admin/admin").createAdmin;

const create_user = require("../controllers/admin/admin").createUser;
const view_users = require("../controllers/admin/admin").getAllUsers;
const view_user = require("../controllers/admin/admin").getOneUser;
const disable_user = require("../controllers/admin/admin").disableUser;
const enable_user = require("../controllers/admin/admin").enableUser;

const create_bill = require("../controllers/admin/admin").createBill;
const view_bills = require("../controllers/admin/admin").getAllBills;
const view_bill = require("../controllers/admin/admin").getOneBill;

const view_trans = require("../controllers/admin/admin").getAllTransactions;
const view_tran = require("../controllers/admin/admin").getOneTransaction;
const view_user_trans =
    require("../controllers/admin/admin").getAllUserTransactions;

const get_compliance_errors =
    require("../controllers/admin/admin").getComplianceErrors;
const set_compliance_errors =
    require("../controllers/admin/admin").setComplianceErrors;
const get_user_cards = require("../controllers/admin/admin").getUserCards
const get_user_company = require("../controllers/admin/admin").getUserCompany
const get_cards = require("../controllers/admin/admin").getAllCards;
const get_card_details = require("../controllers/admin/admin").getCardDetails
const set_rate = require("../controllers/admin/admin").setRate
const approve_compliance = require("../controllers/admin/admin").approveCompliance
const get_compliance_data =  require("../controllers/admin/cac");
const get_all_withdrawals = require("../controllers/admin/withdrawals").getAllWithdrawals
const get_all_deposits = require("../controllers/admin/deposits").getAllDeposits
const create_brex_user = require("../controllers/admin/admin").createBrexAcct
const create_providus_acct = require("../controllers/admin/admin").createReservedAcct;
const update_brex_user = require("../controllers/admin/admin").updateBrexUser;
const approve_withdrawal = require("../controllers/admin/withdrawals").approveWithdrawl
const get_card_txns = require("../controllers/admin/transactions").getCardTxns
const get_usd_rate = require("../controllers/admin/admin").getRate
const get_total_spent = require("../controllers/admin/transactions").getTotalSpent
const get_total_deposit = require("../controllers/admin/deposits").getTotalDeposits
const get_total_users = require("../controllers/admin/admin").getTotalUsers
const get_all_card_txns = require('../controllers/admin/transactions').getAllCardTxns

// login routes
router.post("/login", admin_login);
router.post("/logout", admin_logout);
router.post("/create-admin", create_admin);

// protected admin routes
router.post("/create_user", authAdmin, create_user);
router.get("/view_users", authAdmin, view_users);
router.get("/view_user/:id", authAdmin, view_user);
router.get("/get-user-cards/:id", authAdmin, get_user_cards);
router.get("/get-cards", authAdmin,  get_cards);
router.get("/get-card-details/:id", authAdmin, get_card_details);
router.get("/get-user-company/:id", authAdmin, get_user_company);
router.patch("/disable_user", authAdmin, disable_user);
router.patch("/enable_user", authAdmin, enable_user);

router.post("/create_bill", authAdmin, create_bill);
router.get("/view_bills", authAdmin, view_bills);
router.get("/view_bill/:id", authAdmin, view_bill);

router.get("/view_transactions", authAdmin, view_trans);
router.get("/view_transaction/:id", authAdmin, view_tran);
router.get("/view_user_transactions/:id", authAdmin, view_user_trans);

router.get("/get-compliance-errors", authAdmin, get_compliance_errors);
router.patch("/set-compliance-errors/:id", authAdmin, set_compliance_errors);
router.post("/approve-compliance/:id", authAdmin, approve_compliance)
router.post("/create-card-user/:id", authAdmin, create_brex_user)
router.post("/create-providus-acct/:id", authAdmin, create_providus_acct)
router.post("/update-brex-user/:id", authAdmin, update_brex_user)

router.post("/set-rate/:type", authAdmin, set_rate)
router.get("/get-usd-rate", authAdmin, get_usd_rate)
router.post("/get-compliance-data", authAdmin, get_compliance_data)

router.get("/get-all-withdrawals", authAdmin, get_all_withdrawals)
router.get("/get-all-deposits", authAdmin, get_all_deposits)
router.post("/approve-withdrawal/:id", authAdmin, approve_withdrawal)
router.get("/get-card-txns/:id", authAdmin, get_card_txns)
router.get("/get-all-card-txns", authAdmin, get_all_card_txns)
router.get("/get-total-card-spent", authAdmin, get_total_spent)
router.get("/get-total-deposits", get_total_deposit)
router.get("/get-total-users", authAdmin, get_total_users)

module.exports = router;
