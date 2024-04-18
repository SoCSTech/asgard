import express from "express";
import controller from "@/controllers/auth";
const router = express.Router();

router.post('/auth/login', controller.login);
router.post('/auth/forgot-password', controller.forgotPassword);
router.post('/auth/change-password', controller.changePassword);

export = router;