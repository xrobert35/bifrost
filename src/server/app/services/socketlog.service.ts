import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class SocketLogService {

  socketlogs: { [x: string]: ReplaySubject<string>};


  emitLog(reference: string, log: string) {
    if (!this.socketlogs[reference]) {
      this.socketlogs[reference] = new ReplaySubject<string>(100);
    }

    this.socketlogs[reference].next(log);
  }

  observeLogs(reference: string) {
    return this.socketlogs[reference].subscribe((log) => {

    });
  }
}
