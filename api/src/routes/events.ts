import express from "express";
import controller from "@/controllers/events";
const router = express.Router();

router.get('/event/:id', controller.getEventById);
router.get('/event', controller.getAllEvents);
router.post('/event', controller.createEvent);
router.delete('/event/:id', controller.deleteEvent);
router.put('/event/:id', controller.updateEvent);
router.get('/timetable/:timetableId/events', controller.getEventsForTimetable);

export = router;