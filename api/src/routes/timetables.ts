import express from "express";
import controller from "@/controllers/timetables";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/timetable/deleted', authenticate, controller.getAllDeletedTimetables);
router.get('/timetable/my', authenticate, controller.getMyTimetables);
router.post('/timetable/my', authenticate, controller.addMyTimetables);
router.delete('/timetable/my', authenticate, controller.removeMyTimetables);
router.get('/timetable/:id', controller.getTimetableById);
router.get('/timetable', controller.getAllTimetables);
router.post('/timetable', authenticate, controller.createTimetable);
router.delete('/timetable/:id', authenticate, controller.deleteTimetable);
router.post('/timetable/reactivate/:id', authenticate, controller.undeleteTimetable);
router.put('/timetable/:id', authenticate, controller.updateTimetable);


export = router;