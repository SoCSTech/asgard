import express from "express";
import controller from "@/controllers/carousels";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/carousel/item/:itemId', controller.getCarouselItemById);
router.get('/carousel/:carouselId', controller.getAllCarousels);
router.get('/carousel/:carouselId/items', controller.getAllCarouselItemsForCarousel);
router.get('/timetable/:timetableId/carousel', controller.getAllCarouselsAndItemsForATimetable);

router.post('/carousel', authenticate, controller.createCarousel);
router.post('/carousel/item', authenticate, controller.createCarouselItem);

router.delete('/carousel/:carouselId', authenticate, controller.deleteCarousel);
router.delete('/carousel/item/:itemId', authenticate, controller.deleteCarouselItem);

router.put('/carousel/item/:itemId', authenticate, controller.updateCarousel);
router.put('/carousel/:timetableId', authenticate, controller.updateCarouselItem);

export = router;