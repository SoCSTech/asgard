import express from "express";
import controller from "@/controllers/events";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/event/:id', controller.getEventById);
router.get('/event', controller.getAllEvents);
router.post('/event', authenticate, controller.createEvent);
router.delete('/event/:id', authenticate, controller.deleteEvent);
router.put('/event/:id', authenticate, controller.updateEvent);
router.get('/timetable/:timetableId/events', controller.getEventsForTimetable);
router.get('/timetable/:timetableId/now-next', controller.getNowAndNextEventsForTimetable);

export = router;