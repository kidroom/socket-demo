import express from "express";
import userController from "../controllers/user_controller";
import { authenticateToken } from "../middlewares/auth_middleware";

const router = express.Router();

router.post("/register", userController.Register);
router.post("/login", userController.Login);
router.post("/reset_password", userController.ResetPassword);

export default router;
