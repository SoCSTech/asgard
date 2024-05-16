import express from "express";
import controller from "@/controllers/carousels";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/carousel/item/:itemId', controller.getCarouselItemById);
router.get('/carousel', controller.getAllCarousels);
router.get('/carousel/:carouselId', controller.getCarousel); 
router.get('/timetable/:timetableId/carousel', controller.getAllCarouselsAndItemsForATimetable);

router.post('/carousel', authenticate, controller.createCarousel);
router.post('/carousel/item', authenticate, controller.createCarouselItem);

router.delete('/carousel/item/:itemId', authenticate, controller.deleteCarouselItem);
router.delete('/carousel/:carouselId', authenticate, controller.deleteCarousel);

router.put('/carousel/item/:itemId', authenticate, controller.updateCarouselItem);
router.put('/carousel/:carouselId', authenticate, controller.updateCarousel);

export = router;