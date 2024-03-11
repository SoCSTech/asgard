import express from "express";
import controller from "@/controllers/users";
const router = express.Router();

router.get('/user/:id', controller.getUserById);
router.get('/user', controller.getAllUsers);
router.post('/user', controller.createUser);

export = router;