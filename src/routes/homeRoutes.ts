import controller from "../controllers/homeController";
import validation from "../middleware/validation";
import auth, { isAdmin } from "../middleware/authentication";
const express = require("express");
const router = express.Router();

router.get("/", auth, controller.getAllApplications);
router.get("/:applicationName/users", auth, controller.getApplicationUsers);
router.post("/make-review",validation.makeReviewSchema ,auth,controller.makeReview);
module.exports = router;
