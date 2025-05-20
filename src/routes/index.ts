import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import roleRoutes from "./role.routes";
import permisoRoutes from "./permiso.routes";
import grupoRoutes from "./grupo.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permisos", permisoRoutes);
router.use("/grupos", grupoRoutes);

export default router;
