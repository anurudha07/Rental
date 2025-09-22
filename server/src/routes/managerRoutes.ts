import express from "express";
import {
  getManager,
  createManager,
  updateManager,
  getManagerProperties,
} from "../controllers/managerControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();


router.post("/", createManager);


router.get("/:cognitoId", authMiddleware(["manager", "tenant"]), getManager);
router.put("/:cognitoId", authMiddleware(["manager"]), updateManager);
router.get("/:cognitoId/properties", authMiddleware(["manager"]), getManagerProperties);

export default router;
