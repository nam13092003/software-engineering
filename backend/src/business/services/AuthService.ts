import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { UserRepository } from "../../data/repositories/UserRepository";
import { ActivityLogRepository } from "../../data/repositories/ActivityLogRepository";
import { ApiError } from "../../utils/ApiError";
import { ActivityAction } from "../../domain/models/ActivityLog";
import { hashPassword, verifyPassword } from "../../utils/password";
import { env } from "../../config/env";
import { CreateUserInput, User, UserSafe } from "../../domain/models/User";
import { AuthUser, TokenPayload } from "../../types/auth";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly activityLogRepository: ActivityLogRepository
  ) {}

  private sanitise(user: User): UserSafe {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private async logActivity(userId: string, action: ActivityAction, message: string): Promise<void> {
    await this.activityLogRepository.create({
      id: uuid(),
      userId,
      action,
      message,
      createdAt: new Date()
    });
  }

  private generateToken(user: UserSafe): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const options: SignOptions = { expiresIn: env.tokenExpiration as SignOptions["expiresIn"] };
    return jwt.sign(payload, env.jwtSecret, options);
  }

  async register(input: RegisterInput): Promise<{ user: UserSafe; token: string }> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("Email is already registered");
    }

    const hashed = await hashPassword(input.password);
    const userToCreate: CreateUserInput = {
      id: uuid(),
      name: input.name,
      email: input.email,
      passwordHash: hashed,
      role: "USER"
    };

    const created = await this.userRepository.create(userToCreate);
    const safeUser = this.sanitise(created);
    await this.logActivity(created.id, "REGISTER", `User ${created.email} registered`);
    const token = this.generateToken(safeUser);

    return { user: safeUser, token };
  }

  async login(input: LoginInput): Promise<{ user: UserSafe; token: string }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const safeUser = this.sanitise(user);
    await this.logActivity(user.id, "LOGIN", `User ${user.email} logged in`);
    const token = this.generateToken(safeUser);

    return { user: safeUser, token };
  }

  async listUsers(): Promise<UserSafe[]> {
    const users = await this.userRepository.listAll();
    return users.map((user) => this.sanitise(user));
  }

  async getProfile(userId: string): Promise<UserSafe> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return this.sanitise(user);
  }

  async createMemberAsAdmin(currentUser: AuthUser, input: RegisterInput & { role?: "USER" | "ADMIN" }): Promise<UserSafe> {
    if (currentUser.role !== "ADMIN") {
      throw ApiError.forbidden();
    }

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("Email is already registered");
    }

    const hashed = await hashPassword(input.password);
    const userToCreate: CreateUserInput = {
      id: uuid(),
      name: input.name,
      email: input.email,
      passwordHash: hashed,
      role: input.role ?? "USER"
    };

    const created = await this.userRepository.create(userToCreate);
    await this.logActivity(currentUser.id, "REGISTER", `Admin ${currentUser.email} created ${created.email}`);

    return this.sanitise(created);
  }
}
