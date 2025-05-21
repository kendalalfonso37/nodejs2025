import { Router } from "express";
import {
  assignUserRoles,
  createUser,
  deleteUser,
  getUserDetails,
  getUserRoles,
  getUsers,
  removeUserRole,
  updateUser
} from "../controllers/usersController";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";

const router = Router();

router.get("/", authenticateToken, getUsers);
router.get("/:id", authenticateToken, getUserDetails);
router.post("/", authenticateToken, createUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);
router.get("/:id/roles", authenticateToken, getUserRoles);
router.post("/:id/roles", authenticateToken, assignUserRoles);
router.delete("/:id/roles/:roleId", authenticateToken, removeUserRole);

export default router;
