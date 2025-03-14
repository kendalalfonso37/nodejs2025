import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserDetails,
  getUsers,
  updateUser
} from "../controllers/usersController";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";

const router = Router();

router.get("/", authenticateToken, getUsers);
router.get("/:id", authenticateToken, getUserDetails);
router.post("/", authenticateToken, createUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
