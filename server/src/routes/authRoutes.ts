import express from "express";
import { register, login, getCurrentUser } from "../controllers/authControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/me", authMiddleware(["manager", "tenant", ""]), getCurrentUser);

export default router;
