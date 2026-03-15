"use server";

import { dbService } from "@/lib/services/dbService";
import { Task } from "@/lib/services/types";

export async function fetchEvents(): Promise<Task[]> {
  return await dbService.getEvents();
}

export async function fetchEventById(id: string): Promise<Task | null> {
  return await dbService.getEventById(id);
}

export async function createEvent(newTask: Omit<Task, "id">): Promise<Task> {
  return await dbService.insertEvent(newTask);
}
