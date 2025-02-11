import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  throw Error("Un error ha ocurrido");
  res.json({ message: "Lista de usuarios" });
});

export default router;
