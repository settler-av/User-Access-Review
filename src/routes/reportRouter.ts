import controller from "../controllers/reportController";
import validation from "../middleware/validation";
import auth, { isAdmin } from "../middleware/authentication";
const express = require("express");
const router = express.Router();
import cron from "node-cron";
import logger from "../utils/logger";

// run function every 30 min 
cron.schedule("*/30 * * * *", () => {
    logger.info("Cron JOB: Due review reminder email sent to employee");
    controller.sendReminder();
});
router.get('/', auth, controller.getAllreports);
router.post('/create', auth, validation.createReview, controller.createReview);

module.exports = router;