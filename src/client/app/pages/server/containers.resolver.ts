import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { DockerWebService } from '@rest/docker.webservice';

@Injectable()
export class ContainersResolver implements Resolve<any> {

  constructor(private dockerWebService: DockerWebService) {
  }

  resolve() {
    return this.dockerWebService.list();
  }

}
