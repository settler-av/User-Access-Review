import controller from "../controllers/homeController";
import validation from "../middleware/validation";
import auth, { isAdmin } from "../middleware/authentication";
import multer from "multer";
const express = require("express");
const router = express.Router();
var storage = multer.diskStorage({
    destination: function (req:any, file:any, cb:any) {
        cb(null, "./uploads");
    },
    filename: function (req: any, file: any, cb: any) {
        console.log("here")
        cb(null, Date.now() + "-" + file.originalname);
        console.log("here")
    },
});

const upload = multer({ storage: storage }).single("mom");
router.get("/", auth, controller.getAllApplications);
router.get("/application-access", auth, controller.getAllApplicationAccess);
router.get("/:applicationName/users", auth, controller.getApplicationUsers);
router.post("/make-review",validation.makeReviewSchema ,auth,controller.makeReview);
router.post("/upload",auth,  upload, controller.uploadExcel);
module.exports = router;