import { Observable, Observer } from 'rxjs';
import { Injectable } from '@angular/core';
import * as socketio from 'socket.io-client';

@Injectable()
export class WebSocketClient {

  open(socketUrl: string, containerId: string): Observable<string> {
    // const subject = webSocket('ws://localhost:4081');
    return Observable.create((observer: Observer<string>) => {
      const socket = socketio.connect(socketUrl);
      socket.emit('dockerlogs', { containerId : containerId});
      socket.on('dockerlogs', (evt: string) => {
        observer.next(evt);
      });
    });
  }
}
