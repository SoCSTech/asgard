import express from "express";
import controller from "@/controllers/logs";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/log/:id', controller.getLogById);
router.get('/log', authenticate, controller.getAllLogs);

export = router;