import { Observable, Observer } from 'rxjs';
import { Injectable } from '@angular/core';
import * as socketio from 'socket.io-client';

@Injectable()
export class WebSocketClient {

  private sockets: { [name: string]: SocketIOClient.Socket } = {};

  open(socketName: string): SocketIOClient.Socket {
    let socket = this.sockets[socketName];
    if (!socket) {
      socket = socketio.connect(`ws://${window.location.hostname}:4081/${socketName}`);
      this.sockets[socketName] = socket;
    } else if (socket.disconnected) {
      socket.connect();
    }
    return socket;
  }

  emit(socket: SocketIOClient.Socket, event: string, data: any) {
    socket.emit(event, data);
  }

  onEvent(socket: SocketIOClient.Socket, event: string): Observable<any> {
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
