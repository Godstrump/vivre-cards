const Router = require("express").Router;

// Mount Routes
const adminRoutes = require("./admin.routes");
const usersRoutes = require("./user.routes");
const billRoutes = require("./bill.routes");
const cacRoutes = require("./cac.routes");
const cardsRoutes = require("./card.routes");
const webhookRoutes = require("./webhooks.routes");

const router = Router();

router.use("/admin", adminRoutes);
router.use("/user", usersRoutes);
router.use("/bill", billRoutes);
router.use("/cac", cacRoutes);
router.use("/cards", cardsRoutes);

router.use('/web-hooks', webhookRoutes)

module.exports = router;
