import { Router } from "express";
import { bookService } from "../../config/container";
import { BookController } from "../controllers/BookController";
import { authenticate, requireRoles } from "../../middleware/authMiddleware";

const router = Router();
const controller = new BookController(bookService);

router.get("/", controller.list);
router.get("/search", controller.search);
router.get("/:id", controller.getById);
router.post("/", authenticate, requireRoles("ADMIN"), controller.create);
router.put("/:id", authenticate, requireRoles("ADMIN"), controller.update);
router.delete("/:id", authenticate, requireRoles("ADMIN"), controller.remove);

export const bookRoutes = router;
