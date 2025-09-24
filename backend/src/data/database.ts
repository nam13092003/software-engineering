import { Pool } from "pg";
import { newDb, DataType } from "pg-mem";

let pool: Pool | null = null;

export async function initDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    pool = new Pool({ connectionString });
  } else {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: "now",
      returns: DataType.timestamp,
      implementation: () => new Date()
    });

    const adapter = db.adapters.createPg();
    const MemPool = adapter.Pool;
    pool = new MemPool() as unknown as Pool;
  }

  await applyMigrations(pool);
  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error("Database pool has not been initialised. Call initDatabase() first.");
  }

  return pool;
}

async function applyMigrations(activePool: Pool): Promise<void> {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
     );`,
    `CREATE TABLE IF NOT EXISTS books (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre VARCHAR(120) NOT NULL,
        isbn VARCHAR(64) NOT NULL UNIQUE,
        total_copies INT NOT NULL CHECK (total_copies >= 0),
        available_copies INT NOT NULL CHECK (available_copies >= 0),
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
     );`,
    `CREATE TABLE IF NOT EXISTS loans (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        status VARCHAR(15) NOT NULL,
        borrowed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        due_at TIMESTAMP NOT NULL,
        returned_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
     );`,
    `CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_loans_book_id ON loans(book_id);`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        book_id UUID REFERENCES books(id) ON DELETE SET NULL,
        action VARCHAR(30) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
     );`,
    `CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_logs_book_id ON activity_logs(book_id);`
  ];

  for (const query of queries) {
    await activePool.query(query);
  }
}
