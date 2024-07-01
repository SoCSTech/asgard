import express from "express";
import controller from "@/controllers/search";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/search/:query', authenticate, controller.searchQuery);

export = router;