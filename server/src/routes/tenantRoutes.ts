import express from "express";
import {
  getTenant,
  createTenant,
  updateTenant,
  getCurrentResidences,
  addFavoriteProperty,
  removeFavoriteProperty,
} from "../controllers/tenantControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();


router.post("/", createTenant);


router.get("/:cognitoId", authMiddleware(["tenant", "manager"]), getTenant);
router.put("/:cognitoId", authMiddleware(["tenant"]), updateTenant);
router.get("/:cognitoId/current-residences", authMiddleware(["tenant","manager"]), getCurrentResidences);
router.post("/:cognitoId/favorites/:propertyId", authMiddleware(["tenant"]), addFavoriteProperty);
router.delete("/:cognitoId/favorites/:propertyId", authMiddleware(["tenant"]), removeFavoriteProperty);

export default router;
