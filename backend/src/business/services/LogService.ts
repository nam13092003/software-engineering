import { ActivityLogRepository } from "../../data/repositories/ActivityLogRepository";
import { AuthUser } from "../../types/auth";
import { ApiError } from "../../utils/ApiError";
import { ActivityLogWithDetails } from "../../domain/models/ActivityLog";

export class LogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async listLogs(currentUser: AuthUser, limit = 200): Promise<ActivityLogWithDetails[]> {
    if (currentUser.role !== "ADMIN") {
      throw ApiError.forbidden();
    }

    return this.activityLogRepository.listAll(limit);
  }
}
