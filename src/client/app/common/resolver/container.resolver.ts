import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { DockerWebService } from '@rest/docker.webservice';
import { DockerContainer } from '@shared/interface/container.int';

@Injectable()
export class ContainerResolver implements Resolve<DockerContainer> {

  constructor(private dockerWebService: DockerWebService) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    const containerId = route.paramMap.get('containerId');
    return this.dockerWebService.getContainer(containerId);
  }

}
