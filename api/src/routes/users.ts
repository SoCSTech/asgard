import express from "express";
import controller from "@/controllers/users";
const router = express.Router();

router.get('/user/deleted', controller.getAllDeletedUsers)
router.get('/user', controller.getAllUsers);
router.get('/user/:id.jpg', controller.getUserProfilePicture);
router.get('/user/:id', controller.getUserById);
router.post('/user', controller.createUser);
router.delete('/user/:id', controller.deleteUser);
router.post('/user/reactivate/:id', controller.undeleteUser);
router.put('/user/:id', controller.updateUser);

export = router;