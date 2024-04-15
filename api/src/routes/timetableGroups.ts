import express from "express";
import controller from "@/controllers/timetableGroups";
const router = express.Router();

router.get('/timetable-groups/:id', controller.getTimetableGroupById);
router.get('/timetable-groups', controller.getAllTimetableGroups);
router.post('/timetable-groups', controller.createTimetableGroup);
router.put('/timetable-groups/:id', controller.updateTimetableGroup);
// router.delete('/timetable-groups/:id', controller.deleteTimetableGroup);
// router.put('/timetable-groups/:groupId/:timetableId', controller.addTimetableToGroup);
// router.delete('/timetable-groups/:groupId/:timetableId', controller.removeTimetableToGroup);

export = router;