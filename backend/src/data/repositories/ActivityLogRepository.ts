import { getPool } from "../database";
import {
  ActivityLog,
  ActivityLogWithDetails,
  CreateActivityLogInput
} from "../../domain/models/ActivityLog";

export class ActivityLogRepository {
  private mapRow(row: any): ActivityLog {
    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      action: row.action,
      message: row.message,
      createdAt: new Date(row.created_at)
    };
  }

  private mapDetailRow(row: any): ActivityLogWithDetails {
    return {
      ...this.mapRow(row),
      userName: row.user_name,
      userEmail: row.user_email,
      bookTitle: row.book_title
    };
  }

  async create(data: CreateActivityLogInput): Promise<ActivityLog> {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO activity_logs (id, user_id, book_id, action, message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.id, data.userId, data.bookId ?? null, data.action, data.message, data.createdAt]
    );

    return this.mapRow(result.rows[0]);
  }

  async listAll(limit = 200): Promise<ActivityLogWithDetails[]> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT l.*, u.name AS user_name, u.email AS user_email, b.title AS book_title
       FROM activity_logs l
       LEFT JOIN users u ON u.id = l.user_id
       LEFT JOIN books b ON b.id = l.book_id
       ORDER BY l.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => this.mapDetailRow(row));
  }
}
