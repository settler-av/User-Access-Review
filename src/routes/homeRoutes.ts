import controller from "../controllers/homeController";
import validation from "../middleware/validation";
import auth, { isAdmin } from "../middleware/authentication";
import multer from "multer";
import { mkdirSync } from "fs";
const express = require("express");
const router = express.Router();
var storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        let path = "./uploads";
        mkdirSync(path)
        cb(null, "./uploads");
    },
    filename: function (req: any, file: any, cb: any) {
        console.log("here")
        cb(null, Date.now() + "-" + file.originalname);
        console.log("here")
    },
});

const upload = multer({ storage: storage }).single("mom");

// this two APIs will be used for creating dropdowns in the front end
router.get("/applications", auth, controller.getAllApplications);
router.get("/users", auth, controller.getAllUsers);

router.post("/add", validation.addApplicationAccessSchema, auth, controller.addApplicationAccess);
router.post("/edit/:id", validation.editApplicationAccessSchema, auth, controller.editApplicationAccess);
router.post("/delete/:id", validation.deleteApplicationAccessSchema, auth, controller.deleteApplicationAccess);
router.get("/application-access", auth, controller.getAllApplicationAccess);
router.get("/:applicationName/users", auth, controller.getApplicationUsers);
router.post("/make-review", validation.makeReviewSchema, auth, controller.makeReview);
router.post("/upload", auth, upload, controller.uploadExcel);
module.exports = router;