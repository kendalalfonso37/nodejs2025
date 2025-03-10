import { Router } from "express";
import { login, logout, refreshToken, register } from "../controllers/authController";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", authenticateToken, logout);

export default router;
