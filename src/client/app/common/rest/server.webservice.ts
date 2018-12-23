import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { Server } from '@shared/interface/server.int';
import { Observable } from 'rxjs';

@Injectable()
export class ServerWebService {

  constructor(private httpClient: HttpClient) {
  }

  get(): Observable<Server> {
    return this.httpClient.get<Server>('/api/server').pipe(share());
  }

  createUpdate(server: Server) {
    return this.httpClient.post('/api/server', server).pipe(share());
  }

  containers() {
    return this.httpClient.get('/api/server/containers').pipe(share());
  }
}
