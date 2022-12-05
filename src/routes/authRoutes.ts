import controller from '../controllers/authController';
import validation from '../middleware/validation';
import auth, { isAdmin } from "../middleware/authentication";
const express = require('express');
const router = express.Router();


router.post("/register",validation.registerSchema, isAdmin, controller.register);
router.post('/login',validation.loginSchema, controller.login);
router.post('/change-password',validation.changePasswordSchema, auth, controller.changePassword);
// router.post('/edit-profile', auth, controller.editProfile);

// export default router;
module.exports = router;