const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/authenticate");

// Bill Controllers
const all_bills = require("../controllers/bills/bill").getBills;
const create_bill = require("../controllers/bills/bill").createBill;

// protected routes
router.get("/", authUser, all_bills);
router.post("/", authUser, create_bill);

module.exports = router;
