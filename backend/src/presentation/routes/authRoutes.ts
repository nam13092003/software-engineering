import { Router } from "express";
import { authService } from "../../config/container";
import { AuthController } from "../controllers/AuthController";
import { authenticate, requireRoles } from "../../middleware/authMiddleware";

const router = Router();
const controller = new AuthController(authService);

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authenticate, controller.profile);
router.get("/users", authenticate, requireRoles("ADMIN"), controller.listUsers);
router.post("/users", authenticate, requireRoles("ADMIN"), controller.createUserByAdmin);

export const authRoutes = router;
