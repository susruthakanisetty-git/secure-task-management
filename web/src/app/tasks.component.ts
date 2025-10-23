import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TasksService, Task } from './tasks.service';

type Status = Task['status'] | undefined;

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html', 
})
export class TasksComponent {
  text = '';
  title = '';
  status: Status = undefined;

  constructor(public svc: TasksService) {}

async create() {
  if (!this.title.trim()) return;
  const orgId = localStorage.getItem('orgId')!; 
  await this.svc.create({ title: this.title.trim(), orgId });
  this.title = '';
}


  onTextChange(v: string) {
    this.text = v;
    this.svc.filter.set({ ...this.svc.filter(), text: v });
  }

  onStatusChange(v: Status) {
    this.status = v;
    this.svc.filter.set({ ...this.svc.filter(), status: v });
  }
}
