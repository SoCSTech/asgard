import express from "express";
import controller from "@/controllers/users";
import { authenticate } from "@/middleware/authenticate";
const router = express.Router();

router.get('/user/deleted', authenticate, controller.getAllDeletedUsers)
router.get('/user', authenticate, controller.getAllUsers);
router.get('/user/:id.jpg', controller.getUserProfilePicture);
router.get('/user/:id', authenticate, controller.getUserById);
router.post('/user', authenticate, controller.createUser);
router.delete('/user/:id',authenticate, controller.deleteUser);
router.post('/user/reactivate/:id', authenticate, controller.undeleteUser);
router.put('/user/:id', authenticate, controller.updateUser);

export = router;