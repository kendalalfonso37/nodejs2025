import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import roleRoutes from "./role.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);

export default router;
