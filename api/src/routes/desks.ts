import express from "express";
import controller from "@/controllers/desks";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/desk', authenticate, controller.getAllDesks);
router.get('/desk/:id', controller.getDeskById);
router.get('/desk/mac/:mac', controller.getDeskByMacAddress);
router.get('/timetable/:id/desks', controller.getDesksByTimetable);

export = router;