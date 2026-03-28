"use server";

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.NEON_DATABASE;
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

function getSql() {
  if (!dbUrl) throw new Error("NEON_DATABASE is not set.");
  return neon(dbUrl);
}

export async function fetchProblems() {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM problems 
    WHERE user_id = ${MOCK_USER_ID}
    ORDER BY created_at DESC
  `;
  return rows.map(r => ({ ...r }));
}

export async function getProblemById(id: number) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM problems 
    WHERE id = ${id} AND user_id = ${MOCK_USER_ID}
  `;
  return rows.length ? { ...rows[0] } : null;
}

export async function createProblem(data: {
  title: string;
  description: string;
  importance: string;
  difficulty: string;
  time_level: string;
  complexity: string;
  status?: string;
}) {
  const sql = getSql();
  const status = data.status || "Aberto";
  const rows = await sql`
    INSERT INTO problems (user_id, title, description, importance, difficulty, time_level, complexity, status)
    VALUES (${MOCK_USER_ID}, ${data.title}, ${data.description}, ${data.importance}, ${data.difficulty}, ${data.time_level}, ${data.complexity}, ${status})
    RETURNING id
  `;
  return rows[0].id;
}

export async function updateProblem(id: number, data: {
  title: string;
  description: string;
  importance: string;
  difficulty: string;
  time_level: string;
  complexity: string;
  status: string;
}) {
  const sql = getSql();
  await sql`
    UPDATE problems 
    SET title = ${data.title}, description = ${data.description}, importance = ${data.importance},
        difficulty = ${data.difficulty}, time_level = ${data.time_level}, complexity = ${data.complexity}, 
        status = ${data.status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${MOCK_USER_ID}
  `;
}

export async function deleteProblem(id: number) {
  const sql = getSql();
  await sql`
    DELETE FROM problems WHERE id = ${id} AND user_id = ${MOCK_USER_ID}
  `;
}
