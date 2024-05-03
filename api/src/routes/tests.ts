import express from "express";
import controller from "@/controllers/tests";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/tests/auth', authenticate, controller.testUserAuth);

export = router;