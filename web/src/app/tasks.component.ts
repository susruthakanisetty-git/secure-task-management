// import { Component, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { TasksService } from './tasks.service';

// type Status = 'TODO' | 'IN_PROGRESS' | 'DONE' | undefined;

// @Component({
//   selector: 'app-tasks',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//   <div class="max-w-3xl mx-auto p-6 space-y-4">
//     <div class="flex items-center gap-3">
//       <input [(ngModel)]="title" placeholder="New task title" class="border rounded px-3 py-2 flex-1" />
//       <button class="bg-black text-white rounded px-4 py-2" (click)="create()">Add</button>
//     </div>

//     <div class="flex gap-3">
//       <input [(ngModel)]="svc.filter().text" (ngModelChange)="svc.filter.set({...svc.filter(), text: $event})"
//              placeholder="Search..." class="border rounded px-3 py-2 flex-1" />
//       <select [(ngModel)]="status" (ngModelChange)="svc.filter.set({...svc.filter(), status: $event})" class="border rounded px-3 py-2">
//         <option [ngValue]="undefined">All</option>
//         <option value="TODO">TODO</option>
//         <option value="IN_PROGRESS">IN_PROGRESS</option>
//         <option value="DONE">DONE</option>
//       </select>
//     </div>

//     <ul class="space-y-2">
//       <li *ngFor="let t of svc.filtered()" class="border rounded p-3 flex justify-between items-center">
//         <div>
//           <div class="font-medium">{{t.title}}</div>
//           <div class="text-xs text-gray-500">{{t.status}} • {{t.category || 'General'}}</div>
//         </div>
//         <div class="flex items-center gap-2">
//           <button class="text-xs border rounded px-2 py-1" (click)="advance(t)">Advance</button>
//           <button class="text-xs border rounded px-2 py-1" (click)="remove(t.id)">Delete</button>
//         </div>
//       </li>
//     </ul>
//   </div>
//   `
// })
// export class TasksComponent {
//   svc = inject(TasksService);
//   title = '';
//   status?: 'TODO'|'IN_PROGRESS'|'DONE';

//   async ngOnInit() { await this.svc.load(); }

//   async create() {
//     if (!this.title.trim()) return;
//     // You must pass a valid orgId when creating; if your API infers it from JWT you can omit here
//     await this.svc.create({ title: this.title.trim(), orgId: localStorage.getItem('orgId')! });
//     this.title = '';
//   }

//   async advance(t: any) {
//     const next = t.status === 'TODO' ? 'IN_PROGRESS' : (t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO');
//     await this.svc.update(t.id, { status: next });
//   }

//   async remove(id: string) { await this.svc.remove(id); }
// }



import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TasksService, Task } from './tasks.service';

// whatever your filter type is:
type Status = Task['status'] | undefined;

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html', // or keep inline if you want
})
export class TasksComponent {
  // two-way bound helpers (optional but convenient)
  text = '';
  title = '';
  status: Status = undefined;

  constructor(public svc: TasksService) {}

async create() {
  if (!this.title.trim()) return;
  const orgId = localStorage.getItem('orgId')!; // must exist or controller will infer
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
