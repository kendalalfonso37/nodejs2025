import { Router } from "express";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";
import {
  createPermiso,
  deletePermiso,
  getAllActivePermissions,
  getPermisoDetails,
  getPermisos,
  updatePermiso
} from "../controllers/permisosController";

const router = Router();

router.get("/activos", authenticateToken, getAllActivePermissions);
router.get("/", authenticateToken, getPermisos);
router.get("/:id", authenticateToken, getPermisoDetails);
router.post("/", authenticateToken, createPermiso);
router.put("/:id", authenticateToken, updatePermiso);
router.delete("/:id", authenticateToken, deletePermiso);

export default router;
