import { Router } from "express";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  getAllActiveRoles,
  getRoleDetails,
  getRolePermissions,
  getRoles,
  removeRolePermission,
  updateRole
} from "../controllers/rolesController";

const router = Router();

router.get("/activos", authenticateToken, getAllActiveRoles);
router.get("/", authenticateToken, getRoles);
router.get("/:id", authenticateToken, getRoleDetails);
router.post("/", authenticateToken, createRole);
router.put("/:id", authenticateToken, updateRole);
router.delete("/:id", authenticateToken, deleteRole);
router.get("/:id/permisos", authenticateToken, getRolePermissions);
router.post("/:id/permisos", authenticateToken, assignRolePermissions);
router.delete("/:id/permisos/:permissionId", authenticateToken, removeRolePermission);

export default router;
