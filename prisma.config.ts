import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

const dbUrl = process.env.DATABASE_URL?.startsWith("postgresql://")
  ? process.env.DATABASE_URL
  : `file:${path.resolve(__dirname, "prisma/dev.db")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
