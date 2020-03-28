import { Injectable, HttpStatus } from '@nestjs/common';
import { WinLogger } from '@common/logger/winlogger';
import { Config } from '@config/config';
import { Task } from '@shared/interface/task.int';
import { FunctionalException } from '@common/exception/functional.exception';
import { TechnicalException } from '@common/exception/technical.exception';

import shortUid = require('short-uuid');
import fs = require('fs');

@Injectable()
export class TaskService {

  private static TASKS_CONFIG = `${Config.get().SERVER_DATA}/tasks.json`;

  private tasks: Task[] = [];

  private readonly logger = WinLogger.get('task-service');

  constructor() {
    this.readTasksJson();
  }

  /**
   * Allow to create a task
   * @param taskToCreate
   */
  public createTask(taskToCreate: Task): string {
    let aTask = this.tasks.find(task => task.name === taskToCreate.name);
    if (aTask) {
      throw new FunctionalException('unique-task-name', `Script name "${taskToCreate.name}" already exist`,
        HttpStatus.UNPROCESSABLE_ENTITY);
    }

    aTask = this.tasks.find(task => task.scriptName === taskToCreate.scriptName);
    if (aTask) {
      throw new FunctionalException('unique-task-scriptName',
        `Script name "${taskToCreate.scriptName}" is already using by task : "${aTask.name}"`, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    taskToCreate.reference = shortUid.generate();

    this.tasks.push(taskToCreate);

    this.saveTasksJson();

    return taskToCreate.reference;
  }

  /**
   * Allow to update a task
   * @param task
   */
  public updateTask(task: Task): string {
    const oldTask = this.getTask(task.reference);

    if (!oldTask) {
      throw new TechnicalException('task-not-found', `No task found with reference "${task.reference}"`, HttpStatus.NOT_FOUND);
    }

    Object.assign(oldTask, task);

    this.saveTasksJson();

    return task.reference;
  }

  /**
   * Allow to delete a task
   * @param reference
   */
  public deleteTask(reference: string) {
    const filteredTasks = this.tasks.filter(taskToFilter => {
      return taskToFilter.reference !== reference;
    });

    if (filteredTasks.length === this.tasks.length) {
      throw new FunctionalException('task-not-found', `Task with the reference "${reference}" not found`);
    }

    this.tasks = filteredTasks;

    this.saveTasksJson();
  }

  /**
   * Allow to retreive a task
   * @param reference
   */
  public getTask(reference: string): Task {
    return this.tasks.find(f => f.reference === reference);
  }

  /**
   * Allow to list tasks
   */
  public listTasks(): Task[] {
    return this.tasks;
  }

  private saveTasksJson() {
    fs.writeFileSync(TaskService.TASKS_CONFIG, JSON.stringify(this.tasks));
  }

  private readTasksJson() {
    try {
      if (fs.existsSync(TaskService.TASKS_CONFIG)) {
        const tasks = fs.readFileSync(TaskService.TASKS_CONFIG, 'utf8');
        if (tasks) {
          this.tasks = JSON.parse(tasks);
        }
      }
    } catch (err) {
      this.logger.error('Unabled to read folders list', err);
    }
  }
}
