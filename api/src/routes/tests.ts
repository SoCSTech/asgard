import express from "express";
import controller from "@/controllers/tests";
const router = express.Router();

router.get('/tests/auth', controller.testUserAuth);

export = router;