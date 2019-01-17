import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { Server } from '@shared/interface/server.int';
import { Observable } from 'rxjs';
import { DockerContainer } from '@shared/interface/container.int';
import { UniversalService } from '../universal/universal.service';
import { PruneResult } from '@shared/interface/pruneResult.int';

@Injectable()
export class ServerWebService {

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
  }

  get(): Observable<Server> {
    if (this.universalService.isClient()) {
      return this.httpClient.get<Server>('/api/server').pipe(share());
    }
    return null;
  }

  stopContainer(containerId: string) {
    if (this.universalService.isClient()) {
      return this.httpClient.post(`/api/server/container/${containerId}/stop`, {});
    }
    return null;
  }

  startContainer(containerId: string) {
    return this.httpClient.post(`/api/server/container/${containerId}/start`, {});
  }

  deletetContainer(containerId: string) {
    return this.httpClient.delete(`/api/server/container/${containerId}`, {});
  }

  updateContainer(containerId: string, info: any) {
    return this.httpClient.post(`/api/server/container/${containerId}/update`, info);
  }

  prune() {
    return this.httpClient.post<PruneResult>('/api/server/prune', {});
  }

  createUpdate(server: Server) {
    return this.httpClient.post('/api/server', server).pipe(share());
  }

  containers() {
    if (this.universalService.isClient()) {
      return this.httpClient.get<Array<DockerContainer>>('/api/server/containers').pipe(share());
    }
    return null;
  }
}
