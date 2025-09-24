import type { AuthUser } from "../auth";

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthUser;
    }
  }
}

export {};
