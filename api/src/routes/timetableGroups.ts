import express from "express";
import controller from "@/controllers/timetableGroups";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/timetable-group', controller.getAllTimetableGroups);
router.post('/timetable-group', authenticate, controller.createTimetableGroup);
// router.get('/timetable-groups/:id', controller.getTimetableGroupById);
// router.put('/timetable-groups/:id', authenticate, controller.updateTimetableGroup);
// router.delete('/timetable-groups/:id', authenticate, controller.deleteTimetableGroup);
// router.put('/timetable-groups/:groupId/:timetableId', authenticate, controller.addTimetableToGroup);
// router.delete('/timetable-groups/:groupId/:timetableId', authenticate, controller.removeTimetableToGroup);

export = router;