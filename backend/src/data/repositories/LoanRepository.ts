import { getPool } from "../database";
import {
  CreateLoanInput,
  Loan,
  LoanStatus,
  LoanWithDetails
} from "../../domain/models/Loan";

export class LoanRepository {
  private mapRow(row: any): Loan {
    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      status: row.status as LoanStatus,
      borrowedAt: new Date(row.borrowed_at),
      dueAt: new Date(row.due_at),
      returnedAt: row.returned_at ? new Date(row.returned_at) : null,
      createdAt: new Date(row.created_at)
    };
  }

  private mapDetailRow(row: any): LoanWithDetails {
    return {
      ...this.mapRow(row),
      userName: row.user_name,
      userEmail: row.user_email,
      bookTitle: row.book_title,
      bookAuthor: row.book_author
    };
  }

  async create(data: CreateLoanInput): Promise<Loan> {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO loans (id, user_id, book_id, status, borrowed_at, due_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.id, data.userId, data.bookId, data.status, data.borrowedAt, data.dueAt]
    );

    return this.mapRow(result.rows[0]);
  }

  async findById(id: string): Promise<Loan | null> {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM loans WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async findActiveByUserAndBook(userId: string, bookId: string): Promise<Loan | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT * FROM loans WHERE user_id = $1 AND book_id = $2 AND status = 'BORROWED' LIMIT 1`,
      [userId, bookId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async markAsReturned(id: string, returnedAt: Date): Promise<Loan | null> {
    const pool = getPool();
    const result = await pool.query(
      `UPDATE loans SET status = 'RETURNED', returned_at = $2 WHERE id = $1 AND status = 'BORROWED' RETURNING *`,
      [id, returnedAt]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async listByUser(userId: string): Promise<LoanWithDetails[]> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT l.*, u.name AS user_name, u.email AS user_email, b.title AS book_title, b.author AS book_author
       FROM loans l
       JOIN users u ON u.id = l.user_id
       JOIN books b ON b.id = l.book_id
       WHERE l.user_id = $1
       ORDER BY l.borrowed_at DESC`,
      [userId]
    );

    return result.rows.map((row) => this.mapDetailRow(row));
  }

  async listAll(): Promise<LoanWithDetails[]> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT l.*, u.name AS user_name, u.email AS user_email, b.title AS book_title, b.author AS book_author
       FROM loans l
       JOIN users u ON u.id = l.user_id
       JOIN books b ON b.id = l.book_id
       ORDER BY l.borrowed_at DESC`
    );

    return result.rows.map((row) => this.mapDetailRow(row));
  }
}
