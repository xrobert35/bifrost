import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { DockerContainer } from '@shared/interface/container.int';
import { UniversalService } from '../universal/universal.service';
import { PruneResult } from '@shared/interface/pruneResult.int';

@Injectable()
export class DockerWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/docker`;
  }

  list() {
    return this.httpClient.get<Array<DockerContainer>>(`${this.baseUrl}/containers`).pipe(share());
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

  deleteContainer(containerId: string) {
    return this.httpClient.delete(`${this.baseUrl}/container/${containerId}`, {});
  }

  updateContainer(containerId: string, info: any) {
    return this.httpClient.post(`${this.baseUrl}/container/${containerId}/update`, info);
  }

  prune() {
    return this.httpClient.post<PruneResult>(`${this.baseUrl}/prune`, {});
  }
}
