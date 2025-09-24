import { UserRole } from "../domain/models/User";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}
