import { Router } from "express";
import { loanService } from "../../config/container";
import { LoanController } from "../controllers/LoanController";
import { authenticate, requireRoles } from "../../middleware/authMiddleware";

const router = Router();
const controller = new LoanController(loanService);

router.post("/", authenticate, controller.borrow);
router.post("/:id/return", authenticate, controller.returnLoan);
router.get("/me", authenticate, controller.myLoans);
router.get("/", authenticate, requireRoles("ADMIN"), controller.allLoans);

export const loanRoutes = router;
