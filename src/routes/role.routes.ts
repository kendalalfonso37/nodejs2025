import { Router } from "express";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";
import {
  createRole,
  deleteRole,
  getRoleDetails,
  getRoles,
  updateRole
} from "../controllers/rolesController";

const router = Router();

router.get("/", authenticateToken, getRoles);
router.get("/:id", authenticateToken, getRoleDetails);
router.post("/", authenticateToken, createRole);
router.put("/:id", authenticateToken, updateRole);
router.delete("/:id", authenticateToken, deleteRole);

export default router;
