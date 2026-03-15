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
    const rows = await this.sql`SELECT * FROM events`;
    
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
      steps: [] 
    }));
  }

  async getEventById(id: string): Promise<Task | null> {
    const rows = await this.sql`SELECT * FROM events WHERE id = ${id}`;
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
      steps: []
    };
  }

  async insertEvent(newTask: Omit<Task, "id">): Promise<Task> {
    const rows = await this.sql`
      INSERT INTO events (
        title, description, event_type, start_date, end_date, priority, category, status, location, color
      ) VALUES (
        ${newTask.title},
        ${newTask.description || null},
        ${'Tarefa'},
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
      steps: []
    };
  }
}

// Export singleton instance representing our Data Access Layer
export const dbService = new DatabaseService();
