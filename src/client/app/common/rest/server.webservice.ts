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

  private baseUrl = null;

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/server`;
  }

  get(): Observable<Server> {
    return this.httpClient.get<Server>(`${this.baseUrl}`).pipe(share());
  }

  stopContainer(containerId: string) {
    if (this.universalService.isClient()) {
      return this.httpClient.post(`${this.baseUrl}/container/${containerId}/stop`, {});
    }
    return null;
  }

  startContainer(containerId: string) {
    return this.httpClient.post(`${this.baseUrl}/container/${containerId}/start`, {});
  }

  deletetContainer(containerId: string) {
    return this.httpClient.delete(`${this.baseUrl}/container/${containerId}`, {});
  }

  updateContainer(containerId: string, info: any) {
    return this.httpClient.post(`${this.baseUrl}/container/${containerId}/update`, info);
  }

  prune() {
    return this.httpClient.post<PruneResult>(`${this.baseUrl}/prune`, {});
  }

  createUpdate(server: Server) {
    return this.httpClient.post(`${this.baseUrl}`, server).pipe(share());
  }

  containers() {
    return this.httpClient.get<Array<DockerContainer>>(`${this.baseUrl}/containers`).pipe(share());
  }
}
