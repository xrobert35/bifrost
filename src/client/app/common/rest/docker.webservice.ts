import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share, tap } from 'rxjs/operators';
import { DockerContainer } from '@shared/interface/container.int';
import { UniversalService } from '../universal/universal.service';
import { PruneResult } from '@shared/interface/pruneResult.int';
import { forEach } from 'lodash';

@Injectable()
export class DockerWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/docker`;
  }

  list(stack?: string) {
    const params: any = {};
    if (stack) {
      params.stack = stack;
    }
    return this.httpClient.get<Array<DockerContainer>>(`${this.baseUrl}/containers`, { params: params })
      .pipe(share(), tap(containers => {
        forEach(containers, container => this.addDetail(container));
      }));
  }

  getContainer(containerId: string) {
    return this.httpClient.get<DockerContainer>(`${this.baseUrl}/container/${containerId}`)
      .pipe(share(), tap(container => this.addDetail(container)));
  }

  stopContainer(containerId: string) {
    return this.httpClient.post(`${this.baseUrl}/container/${containerId}/stop`, {});
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

  private addDetail(container: DockerContainer) {
    if (container.Name) {
      container.name = container.Name.substring(1);
    } else {
      container.name = container.Names[0].substring(1);
    }
    if (container.Image) {
      container.imageName = container.Image.split(':')[0];

      const slashIndex = container.imageName.indexOf('/');
      if (slashIndex !== -1) {
        container.imageRepo = container.imageName.substring(0, slashIndex);
        container.imageName = container.imageName.substring(slashIndex +  1);
      }
      container.tag = container.Image.split(':')[1];
    } else {
      container.imageName = 'unknown';
      container.tag = 'unknown';
    }

    container.tooltip = container.ImageDigestId || container.ImageID;
  }
}
