import { Router } from "express";
import { logService } from "../../config/container";
import { LogController } from "../controllers/LogController";
import { authenticate, requireRoles } from "../../middleware/authMiddleware";

const router = Router();
const controller = new LogController(logService);

router.get("/", authenticate, requireRoles("ADMIN"), controller.list);

export const logRoutes = router;
