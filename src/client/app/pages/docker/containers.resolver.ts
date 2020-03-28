import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { DockerWebService } from '@rest/docker.webservice';
import { DockerContainer } from '@shared/interface/container.int';

@Injectable()
export class ContainersResolver implements Resolve<DockerContainer[]> {

  constructor(private dockerWebService: DockerWebService) {
  }

  resolve() {
    return this.dockerWebService.list();
  }

}
