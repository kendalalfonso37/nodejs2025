import { Router } from "express";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";
import {
  createGroup,
  deleteGroup,
  getGroupDetails,
  getGroups,
  updateGroup
} from "../controllers/gruposController";

const router = Router();

router.get("/activos", authenticateToken, getGroups);
router.get("/", authenticateToken, getGroups);
router.get("/:id", authenticateToken, getGroupDetails);
router.post("/", authenticateToken, createGroup);
router.put("/:id", authenticateToken, updateGroup);
router.delete("/:id", authenticateToken, deleteGroup);

export default router;
