import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { Task } from '@shared/interface/task.int';
import { TaskWebService } from '@rest/task.webservice';

@Component({
  selector: 'task-helper-page',
  host: { 'class': 'task-helper page' },
  templateUrl: './task-helper.page.html'
})
export class TaskHelperPage {

  taskForm: FormGroup;
  selectedTask: Task;
  tasks: Task[];

  constructor(private formBuilder: FormBuilder,
    private bifrostNotificationService: BifrostNotificationService,
    private taskService: TaskWebService) {

    this.taskForm = this.formBuilder.group({
      name: [null, Validators.required],
      script: [null, Validators.required],
      cron: [null],
      reference: null
    });
  }

  onFormSubmit() {
    if (this.taskForm.valid) {
      const task = this.taskForm.value;
      if (!this.selectedTask) {
        this.taskService.create(task).subscribe((createdTask) => {
          this.bifrostNotificationService.showSuccess(`New Task has been added`);
          this.tasks.push(createdTask);
        });
      } else {
        this.taskService.update(task).subscribe(() => {
          this.bifrostNotificationService.showSuccess(`Task ${task.name} has been updated`);
          Object.assign(this.selectedTask, task);
        });
      }
    }
  }

}
