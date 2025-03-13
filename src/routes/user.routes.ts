import { Router } from "express";
import { createUser, getUserDetails, getUsers } from "../controllers/usersController";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";

const router = Router();

router.get("/", authenticateToken, getUsers);
router.get("/:id", authenticateToken, getUserDetails);
router.post("/", authenticateToken, createUser);

export default router;
