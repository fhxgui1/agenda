import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const dbUrl = process.env.NEON_DATABASE;

if (!dbUrl) {
  throw new Error("NEON_DATABASE environment variable is not defined");
}

const sql = neon(dbUrl);

async function runMigration() {
  console.log("🟡 Iniciando criação da tabela problem_requirements...");

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS problem_requirements (
        id SERIAL PRIMARY KEY,
        problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE
      )
    `;

    console.log("✅ Tabela 'problem_requirements' criada com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a criação:", error);
  }
}

runMigration();
