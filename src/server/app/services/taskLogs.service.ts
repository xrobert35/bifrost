import { Injectable } from '@nestjs/common';

import { ReplaySubject } from 'rxjs';
import { Log } from '@shared/interface/log.int';
import { isEmpty } from 'lodash';
import shortUid = require('short-uuid');

import AU = require('ansi_up');
const ansi_up = new AU.default;

@Injectable()
export class TaskLogsService {

  private taskLogs: { [name: string]: ReplaySubject<Log> } = {};

  constructor() { }

  newTask(taskPrefix: string) {
    const taskId = `${taskPrefix}-${shortUid.generate()}`;
    const taskNotifier = new ReplaySubject<Log>();
    this.taskLogs[taskId] = taskNotifier;
    return taskId;
  }

  endTask(taskId: string) {
    this.taskLogs[taskId].complete();
    delete this.taskLogs[taskId];
  }

  addLog(taskId: string, stdout: string, stderr: string) {
    const nofifSubject = this.taskLogs[taskId];

    let logSent = false;
    if (!isEmpty(stdout)) {
      logSent = true;
      nofifSubject.next({ msg: ansi_up.ansi_to_html(stdout), type: 'INFO' });
    }
    if (!isEmpty(stderr)) {
      logSent = true;
      nofifSubject.next({ msg: ansi_up.ansi_to_html(stderr), type: 'ERROR' });
    }
    if (!logSent) {
      logSent = true;
      nofifSubject.next({ msg: ansi_up.ansi_to_html(stdout), type: 'INFO' });
    }
  }

  streamLog(taskId: string){
    return this.taskLogs[taskId];
  }

}
