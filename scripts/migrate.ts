import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function verifyAndMigrate() {
  if (!process.env.NEON_DATABASE) {
    console.error("NEON_DATABASE is not set");
    process.exit(1);
  }
  
  const sql = neon(process.env.NEON_DATABASE);
  
  try {
    console.log("Adding column project_id to events table...");
    await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES events(id) ON DELETE CASCADE`;
  } catch (error: any) {
    console.log("Could not add project_id column or it already exists:", error.message);
  }

  try {
    console.log("Adding column has_time to events table...");
    await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS has_time BOOLEAN DEFAULT TRUE`;
  } catch (error: any) {
    console.log("Could not add has_time column or it already exists:", error.message);
  }

  try {
    console.log("Creating activity_types table...");
    await sql`
      CREATE TABLE IF NOT EXISTS activity_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        color_theme VARCHAR(100) DEFAULT 'bg-blue-100 border-blue-200 text-blue-700',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Insert default activity types
    await sql`
      INSERT INTO activity_types (name, color_theme) 
      VALUES 
        ('Desenvolvimento', 'bg-emerald-100 border-emerald-200 text-emerald-700'),
        ('Finanças', 'bg-green-100 border-green-200 text-green-700'),
        ('Tarefa Normal', 'bg-blue-100 border-blue-200 text-blue-700'),
        ('Estudos', 'bg-purple-100 border-purple-200 text-purple-700')
      ON CONFLICT (name) DO NOTHING;
    `;
    
  } catch (error: any) {
    console.error("Error creating activity_types:", error.message);
  }
  
  try {
      console.log('Adding column activity_type_id to events ...');
      await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS activity_type_id UUID REFERENCES activity_types(id) ON DELETE SET NULL`;
  } catch (e: any) {
      console.log('Could not add activity_type_id or it already exists', e.message);
  }

  console.log("Migration finished.");
}

verifyAndMigrate().catch(console.error);
