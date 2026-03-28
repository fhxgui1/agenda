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
  console.log("🟡 Iniciando criação da tabela de Problems (Solved)...");

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS problems (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        importance VARCHAR(50) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        time_level VARCHAR(50) NOT NULL,
        complexity VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Aberto',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("✅ Tabela 'problems' criada/verificada com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a criação:", error);
  }
}

runMigration();
