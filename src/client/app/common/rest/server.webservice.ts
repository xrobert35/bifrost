import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { Server } from '@shared/interface/server.int';
import { Observable } from 'rxjs';
import { DockerContainer } from '@shared/interface/container.int';

@Injectable()
export class ServerWebService {

  constructor(private httpClient: HttpClient) {
  }

  get(): Observable<Server> {
    return this.httpClient.get<Server>('/api/server').pipe(share());
  }

  stopContainer(containerId: string) {
    return this.httpClient.post(`/api/server/container/${containerId}/stop`, {});
  }

  startContainer(containerId: string) {
    return this.httpClient.post(`/api/server/container/${containerId}/start`, {});
  }

  recreateContainer(containerId: string, info: any) {
    return this.httpClient.post(`/api/server/container/${containerId}/recreate`, info);
  }

  createUpdate(server: Server) {
    return this.httpClient.post('/api/server', server).pipe(share());
  }

  containers() {
    return this.httpClient.get<Array<DockerContainer>>('/api/server/containers').pipe(share());
  }
}
