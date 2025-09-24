import { getPool } from "../database";
import { CreateUserInput, User } from "../../domain/models/User";

export class UserRepository {
  private mapRow(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: new Date(row.created_at)
    };
  }

  async create(data: CreateUserInput): Promise<User> {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.id, data.name, data.email, data.passwordHash, data.role]
    );

    return this.mapRow(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async listAll(): Promise<User[]> {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`);
    return result.rows.map((row) => this.mapRow(row));
  }
}
