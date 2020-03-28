import { Observable, Observer } from 'rxjs';
import { Injectable } from '@angular/core';
import * as socketio from 'socket.io-client';

@Injectable()
export class WebSocketClient {

  open(socketName: string): SocketIOClient.Socket {
    return socketio.connect(`ws://${window.location.hostname}:4081/${socketName}`);
  }

  emit(socket: SocketIOClient.Socket, event: string, data: any) {
    socket.emit(event, data);
  }

  onEvent(socket: SocketIOClient.Socket, event: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      socket.on(event, (evt: string) => {
        observer.next(evt);
      });
    });
  }

  close(socket: SocketIOClient.Socket) {
    socket.close();
  }
}
