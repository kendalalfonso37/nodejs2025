import { Router } from "express";
import { getUsers } from "../controllers/usersController";
import { authenticateToken } from "../middlewares/jsonWebTokenAuth";

const router = Router();

router.get("/", authenticateToken, getUsers);

export default router;
