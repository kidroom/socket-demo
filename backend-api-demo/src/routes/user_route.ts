import express from "express";
import userController from "../controllers/user_controller";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", userController.Register);
router.post("/login", userController.Login);
router.post("/reset_password", userController.ResetPassword);
//router.get("/protected", authenticateToken, userController.protectedRoute);
// 可以添加其他的路由 (POST, PUT, DELETE 等)
export default router;
