import controller from '../controllers/authController';
import validation from '../middleware/validation';
import auth, { isAdmin } from "../middleware/authentication";
const express = require('express');
const router = express.Router();



module.exports = router;
