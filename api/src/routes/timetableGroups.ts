import express from "express";
import controller from "@/controllers/timetableGroups";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/timetable-group', controller.getAllTimetableGroups);
router.post('/timetable-group', authenticate, controller.createTimetableGroup);
router.put('/timetable-group/:id', authenticate, controller.updateTimetableGroup);
router.delete('/timetable-group/:id', authenticate, controller.deleteTimetableGroup);
// router.put('/timetable-group/:groupId/:timetableId', authenticate, controller.addTimetableToGroup);
// router.delete('/timetable-group/:groupId/:timetableId', authenticate, controller.removeTimetableToGroup);
// router.get('/timetable-group/:id', controller.getTimetableGroupById);

export = router;