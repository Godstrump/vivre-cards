const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/authenticate");
const getBVN = require("../controllers/user/bvn");

// CAC Controllers
const cac = require("../controllers/user/cac");
const affiliates = require("../controllers/user/cacaffiliates");

router.post("/cac", authUser, cac);
router.post("/affiliates", authUser, affiliates);
router.post("/get-bvn", getBVN);

module.exports = router;
