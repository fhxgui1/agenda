import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.NEON_DATABASE;
if (!dbUrl) {
  console.error("NEON_DATABASE is not set in .env");
  process.exit(1);
}

const sql = neon(dbUrl);

async function run() {
  try {
    console.log("Creating exercise_catalog...");
    await sql`
      CREATE TABLE IF NOT EXISTS exercise_catalog (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          muscle_group VARCHAR(100) NOT NULL
      );
    `;

    console.log("Creating training_programs...");
    await sql`
      CREATE TABLE IF NOT EXISTS training_programs (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          focus VARCHAR(255),
          is_active BOOLEAN DEFAULT FALSE,
          current_session_index INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Creating training_sessions...");
    await sql`
      CREATE TABLE IF NOT EXISTS training_sessions (
          id SERIAL PRIMARY KEY,
          program_id INT REFERENCES training_programs(id) ON DELETE CASCADE,
          name VARCHAR(50) NOT NULL,
          sequence_order INT NOT NULL
      );
    `;

    console.log("Creating program_exercises...");
    await sql`
      CREATE TABLE IF NOT EXISTS program_exercises (
          id SERIAL PRIMARY KEY,
          session_id INT REFERENCES training_sessions(id) ON DELETE CASCADE,
          exercise_catalog_id INT REFERENCES exercise_catalog(id) ON DELETE RESTRICT,
          sets INT NOT NULL,
          target_reps INT NOT NULL,
          sequence_order INT NOT NULL
      );
    `;

    console.log("Seeding exercise_catalog...");
    await sql`
      INSERT INTO exercise_catalog (name, muscle_group) VALUES 
      ('Supino Reto', 'Peitoral'),
      ('Supino Inclinado', 'Peitoral'),
      ('Crucifixo', 'Peitoral'),
      ('Puxada Frontal', 'Costas'),
      ('Remada Curvada', 'Costas'),
      ('Tríceps Polia', 'Tríceps'),
      ('Rosca Direta', 'Bíceps'),
      ('Leg Press 45', 'Pernas'),
      ('Agachamento Livre', 'Pernas'),
      ('Elevação Lateral', 'Ombros')
      ON CONFLICT (name) DO NOTHING;
    `;
    console.log("Schema and seeds executed successfully.");
  } catch (error) {
    console.error("Error running migration:", error);
  }
}

run();
