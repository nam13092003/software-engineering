import { getPool } from "../database";
import { Book, CreateBookInput, UpdateBookInput } from "../../domain/models/Book";

export class BookRepository {
  private mapRow(row: any): Book {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      genre: row.genre,
      isbn: row.isbn,
      totalCopies: Number(row.total_copies),
      availableCopies: Number(row.available_copies),
      description: row.description,
      createdAt: new Date(row.created_at)
    };
  }

  async create(data: CreateBookInput): Promise<Book> {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO books (id, title, author, genre, isbn, total_copies, available_copies, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.id,
        data.title,
        data.author,
        data.genre,
        data.isbn,
        data.totalCopies,
        data.availableCopies,
        data.description ?? null
      ]
    );

    return this.mapRow(result.rows[0]);
  }

  async update(id: string, patch: UpdateBookInput): Promise<Book | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const merged: UpdateBookInput = {
      title: patch.title ?? existing.title,
      author: patch.author ?? existing.author,
      genre: patch.genre ?? existing.genre,
      isbn: patch.isbn ?? existing.isbn,
      totalCopies: patch.totalCopies ?? existing.totalCopies,
      availableCopies: patch.availableCopies ?? existing.availableCopies,
      description: patch.description ?? existing.description ?? null
    };

    const pool = getPool();
    const result = await pool.query(
      `UPDATE books
       SET title = $2,
           author = $3,
           genre = $4,
           isbn = $5,
           total_copies = $6,
           available_copies = $7,
           description = $8
       WHERE id = $1
       RETURNING *`,
      [
        id,
        merged.title,
        merged.author,
        merged.genre,
        merged.isbn,
        merged.totalCopies,
        merged.availableCopies,
        merged.description ?? null
      ]
    );

    return this.mapRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const pool = getPool();
    await pool.query(`DELETE FROM books WHERE id = $1`, [id]);
  }

  async findById(id: string): Promise<Book | null> {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM books WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM books WHERE isbn = $1`, [isbn]);
    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async listAll(): Promise<Book[]> {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM books ORDER BY created_at DESC`);
    return result.rows.map((row) => this.mapRow(row));
  }

  async search(term?: string, genre?: string): Promise<Book[]> {
    const pool = getPool();
    const filters: string[] = [];
    const values: any[] = [];

    if (term) {
      filters.push(`(title ILIKE $${filters.length + 1} OR author ILIKE $${filters.length + 1} OR isbn ILIKE $${filters.length + 1})`);
      values.push(`%${term}%`);
    }

    if (genre) {
      filters.push(`genre ILIKE $${filters.length + 1}`);
      values.push(`%${genre}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const result = await pool.query(`SELECT * FROM books ${whereClause} ORDER BY title ASC`, values);
    return result.rows.map((row) => this.mapRow(row));
  }

  async decrementAvailableCopies(bookId: string): Promise<Book | null> {
    const pool = getPool();
    const result = await pool.query(
      `UPDATE books SET available_copies = available_copies - 1
       WHERE id = $1 AND available_copies > 0
       RETURNING *`,
      [bookId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async incrementAvailableCopies(bookId: string): Promise<Book | null> {
    const pool = getPool();
    const result = await pool.query(
      `UPDATE books SET available_copies = available_copies + 1
       WHERE id = $1 AND available_copies < total_copies
       RETURNING *`,
      [bookId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }
}
