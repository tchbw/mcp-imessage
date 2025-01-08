import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// Create or open a local SQLite DB file (adjust path/filename as needed)
const sqlite = new Database(process.env.DATABASE_URL);

// Drizzle ORM connection
export const db = drizzle(sqlite);
