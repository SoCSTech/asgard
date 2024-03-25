import express from "express";
import controller from "@/controllers/timetables";
const router = express.Router();

router.get('/timetable/:id', controller.getTimetableById);
router.get('/timetable', controller.getAllTimetables);
router.post('/timetable', controller.createTimetable);
router.delete('/timetable', controller.deleteTimetable);
router.post('/timetable/reactivate', controller.undeleteTimetable);


export = router;