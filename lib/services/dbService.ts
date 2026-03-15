import { Task } from "./types";
import { neon } from '@neondatabase/serverless';

class DatabaseService {
  private get sql() {
    if (!process.env.NEON_DATABASE) {
      throw new Error("NEON_DATABASE environment variable is not set.");
    }
    return neon(process.env.NEON_DATABASE);
  }

  constructor() {}

  // --- MICROSERVICE QUERIES/MUTATIONS --- //
  
  async getEvents(): Promise<Task[]> {
    const rows = await this.sql`
      SELECT 
        e.*,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'text', s.text, 'done', s.is_completed) ORDER BY s.step_order
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) AS steps
      FROM events e
      LEFT JOIN event_steps s ON e.id = s.event_id
      GROUP BY e.id
    `;
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      start: new Date(row.start_date || new Date()),
      end: new Date(row.end_date || new Date()),
      color: row.color,
      priority: row.priority as any,
      type: row.category as any, 
      status: row.status,
      location: row.location,
      eventType: row.event_type,
      steps: row.steps 
    }));
  }

  async getEventById(id: string): Promise<Task | null> {
    const rows = await this.sql`
      SELECT 
        e.*,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'text', s.text, 'done', s.is_completed) ORDER BY s.step_order
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) AS steps
      FROM events e
      LEFT JOIN event_steps s ON e.id = s.event_id
      WHERE e.id = ${id}
      GROUP BY e.id
    `;
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      start: new Date(row.start_date || new Date()),
      end: new Date(row.end_date || new Date()),
      color: row.color,
      priority: row.priority as any,
      type: row.category as any,
      status: row.status,
      location: row.location,
      eventType: row.event_type,
      steps: row.steps
    };
  }

  async insertEvent(newTask: Omit<Task, "id">): Promise<Task> {
    const rows = await this.sql`
      INSERT INTO events (
        title, description, event_type, start_date, end_date, priority, category, status, location, color
      ) VALUES (
        ${newTask.title},
        ${newTask.description || null},
        ${newTask.eventType || 'Tarefa'},
        ${newTask.start},
        ${newTask.end},
        ${newTask.priority || 'Média'},
        ${newTask.type || 'Pessoal'},
        ${newTask.status || 'Pendente'},
        ${newTask.location || null},
        ${newTask.color || 'bg-blue-100 border-blue-200 text-blue-700'}
      ) RETURNING *
    `;
    
    const row = rows[0];
    const insertedSteps = [];

    if (newTask.steps && newTask.steps.length > 0) {
      for (let i = 0; i < newTask.steps.length; i++) {
        const step = newTask.steps[i];
        if (step.text.trim() === '') continue; // Skip empty steps
        
        const stepRows = await this.sql`
          INSERT INTO event_steps (event_id, text, step_order, is_completed)
          VALUES (${row.id}, ${step.text}, ${i}, ${step.done || false})
          RETURNING *
        `;
        
        if (stepRows.length > 0) {
           insertedSteps.push({
             id: stepRows[0].id,
             text: stepRows[0].text,
             done: stepRows[0].is_completed
           });
        }
      }
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      start: new Date(row.start_date),
      end: new Date(row.end_date),
      color: row.color,
      priority: row.priority as any,
      type: row.category as any,
      status: row.status,
      location: row.location,
      eventType: row.event_type,
      steps: insertedSteps
    };
  }

  // Completes a task/event
  async updateEventStatus(id: string, status: string): Promise<void> {
    await this.sql`UPDATE events SET status = ${status} WHERE id = ${id}`;
  }

  // Toggles step completion
  async toggleStep(id: string | number, done: boolean): Promise<void> {
    await this.sql`UPDATE event_steps SET is_completed = ${done} WHERE id = ${id}`;
  }
}

// Export singleton instance representing our Data Access Layer
export const dbService = new DatabaseService();
