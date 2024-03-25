import express from "express";
import controller from "@/controllers/users";
const router = express.Router();

router.get('/user/:id', controller.getUserById);
router.get('/user', controller.getAllUsers);
router.post('/user', controller.createUser);
router.delete('/user', controller.deleteUser);
router.post('/user/reactivate', controller.undeleteUser);

export = router;