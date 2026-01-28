import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

let prisma: PrismaClient;

// 检查是否是 PostgreSQL 连接
if (connectionString && connectionString.startsWith("postgresql://")) {
  // 使用 PostgreSQL
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // 使用 SQLite 进行本地开发
  const dbPath = join(__dirname, "../prisma/dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  prisma = new PrismaClient({ adapter });
}

export { prisma };
