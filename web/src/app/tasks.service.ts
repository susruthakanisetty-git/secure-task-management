import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'TODO'|'IN_PROGRESS'|'DONE';
  category?: string;
  order: number;
  orgId: string;
};

@Injectable({ providedIn: 'root' })
export class TasksService {
  private base = 'http://localhost:3000/api';
  tasks = signal<Task[]>([]);
  filter = signal<{ text?: string; status?: Task['status']; category?: string }>({});
  filtered = computed(() => {
    const f = this.filter();
    return this.tasks().filter(t =>
      (!f.text || t.title.toLowerCase().includes(f.text.toLowerCase())) &&
      (!f.status || t.status === f.status) &&
      (!f.category || t.category === f.category)
    ).sort((a,b)=> a.order - b.order);
  });

  constructor(private http: HttpClient) {}

  async load() {
  const result = await this.http.get<Task[]>(`${this.base}/tasks`).toPromise();
  this.tasks.set(result ?? []);  
}
  async create(input: Partial<Task>) {
    const t = await this.http.post<Task>(`${this.base}/tasks`, input).toPromise();
    this.tasks.update(v => [t!, ...v]);
  }
  async update(id: string, patch: Partial<Task>) {
    const t = await this.http.put<Task>(`${this.base}/tasks/${id}`, patch).toPromise();
    this.tasks.update(v => v.map(x => x.id === id ? t! : x));
  }
  async remove(id: string) {
    await this.http.delete(`${this.base}/tasks/${id}`).toPromise();
    this.tasks.update(v => v.filter(x => x.id !== id));
  }
}
