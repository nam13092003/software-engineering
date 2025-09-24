import dotenv from "dotenv";

dotenv.config();

function ensureEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: ensureEnv("JWT_SECRET", "dev-secret"),
  tokenExpiration: process.env.TOKEN_EXPIRATION ?? "1h"
};
