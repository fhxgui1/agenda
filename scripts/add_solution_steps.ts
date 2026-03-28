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
  console.log("🟡 Atualizando tabela de Problems para adicionar solution_steps...");

  try {
    await sql`
      ALTER TABLE problems 
      ADD COLUMN IF NOT EXISTS solution_steps JSONB DEFAULT '[]'::jsonb
    `;
    console.log("✅ Coluna 'solution_steps' adicionada com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a atualização:", error);
  }
}

runMigration();
