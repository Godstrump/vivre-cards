const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/authenticate");

// User Controllers
const user_user = require("../controllers/user/user").userUser;
const user_login = require("../controllers/user/login").userLogin;
const user_logout = require("../controllers/user/login").userLogout;
const user_signup = require("../controllers/user/register");
const email_verify = require("../controllers/user/verifyEmail");
const recover_password = require("../controllers/user/forgotPassword");
const verify_reset = require("../controllers/user/verifyRecoveryUser");
const reset_password = require("../controllers/user/resetPassword").resetPassword;
const user_deposit = require("../controllers/user/deposit").deposit;
const user_deposits = require("../controllers/user/deposit").getDeposits;
const user_transfer = require("../controllers/user/transfer").transfer;
const user_transfers = require("../controllers/user/transfer").getTransfers;
const user_transactions =
    require("../controllers/user/transactions").getTransactions;
const user_transaction =
    require("../controllers/user/transactions").getTransaction;
const bill_payments = require("../controllers/user/bill").getBillpayments;
const pay_bill = require("../controllers/user/bill").payBill;
const complete_compliance =
    require("../controllers/user/user").completeCompliance;
const countries = require("../controllers/user/user").getCountries;
const sectors = require("../controllers/user/user").getSectors;
const upload = require("../util/imageUtility");
const get_compliance_errors =
    require("../controllers/user/user").getComplianceErrors;
const update_compliance =
    require("../controllers/user/user").updateUserCompliance;
const get_compliance_data =
    require("../controllers/user/user").getUserCompliance;
const init_deposit = require("../controllers/user/deposit").initDeposit
const validateUser = require("../util/validateUser")
const create_reserved_acct = require("../controllers/user/deposit").createReservedAccount
const fundWithLazerPay = require("../controllers/user/deposit").fundWithLazerPay
const get_refresh_token = require("../controllers/user/login").getRefreshToken
const initiate_withdrawal = require("../controllers/user/withdrawal").initiateWithdrawals
const refreshBalance = require("../controllers/user/deposit").refreshBalance
const send_otp = require("../controllers/user/login").sendOtp
const login = require("../controllers/user/login").login
const change_password = require("../controllers/user/resetPassword").changePassword
const add_bank_acct = require("../controllers/user/user").addBankAcct
const get_bank_accts = require("../controllers/user/user").getBankDetails
const delete_bank_acct = require("../controllers/user/user").deleteBankDetails;
const get_banks = require("../controllers/user/user").getBanks

// user route handler
router.post("/user", user_user);

router.post("/send-otp", send_otp)
router.post("/login", user_login);
router.post("/user-login", login)
router.post("/signup", user_signup);
router.post("/vendgram/email-verification", email_verify);
router.post("/recover_password", recover_password);
router.post("/verify_reset/:token", verify_reset);
router.post("/reset_password/:resetToken", reset_password);
router.post("/logout", user_logout);

// protected routes
router.post("/deposit", authUser, validateUser, user_deposit);
// router.get("/deposit", authUser, validateUser, user_deposits);
router.get("/init-deposit-rate/:type", authUser, validateUser, init_deposit)

router.post("/transfer", authUser, user_transfer);
router.get("/transfer", authUser, user_transfers);

router.get("/transactions", authUser, user_transactions);
router.get("/transactions/:id", authUser, user_transaction);

router.post("/paybill", authUser, pay_bill);
router.get("/bills", authUser, bill_payments);

const docUpload = upload.fields([
    { name: "addressProof", maxCount: 1 },
    { name: "documentId", maxCount: 1 },
]);
router.post("/complete-profile", authUser, docUpload, complete_compliance);
router.get("/countries", authUser, countries);
router.get("/sectors", authUser, sectors);

router.get("/get-compliance-errors", authUser, get_compliance_errors);
router.get("/get-compliance-data", authUser, get_compliance_data);
router.patch("/update-compliance", authUser, docUpload, update_compliance);
router.post("/change-password", authUser, validateUser, change_password)

router.patch("/create-reserved-account/:id", authUser, create_reserved_acct);
router.post("/fund-with-lazerpay", authUser, validateUser, fundWithLazerPay)
router.get("/get-refresh-token", get_refresh_token)
router.post("/initiate-withdrawal", authUser, validateUser, initiate_withdrawal)
router.get("/refresh-balance", authUser, validateUser, refreshBalance)

router.get("/get-all-banks", authUser, validateUser, get_banks)
router.post("/add-bank-account", authUser, validateUser, add_bank_acct)
router.get("/get-user-bank-accounts", authUser, validateUser, get_bank_accts)
router.delete("/delete-user-bank-account/:id", authUser, validateUser, delete_bank_acct)


module.exports = router;
