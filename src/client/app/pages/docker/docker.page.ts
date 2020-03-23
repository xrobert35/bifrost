import { Component } from '@angular/core';
import { Server } from '@shared/interface/server.int';
import { find } from 'lodash';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { DockerWebService } from '@rest/docker.webservice';
import { DockerStack } from '@shared/interface/stack.int';

@Component({
  selector: 'docker-page',
  host: { 'class': 'docker-page page' },
  templateUrl: './docker.page.html'
})
export class DockerPage {

  stacks: Array<DockerStack>;
  server: Server;

  logContainerId: string = null;

  display: 'list' | 'stack' = 'stack';

  constructor(private bifrostNotificationService: BifrostNotificationService,
    private dockerWebService: DockerWebService) {
  }

  ngOnInit() {
    this.refreshContainerInformation(this.display);
  }

  async refreshContainerInformation(display: 'list' | 'stack') {
    const containers = await this.initContainersInformations();

    if (display === 'list') {
      this.stacks = [{
        started: !!containers.find(container => container.State === 'running'),
        containers: containers
      }];
    } else {
      this.stacks = containers.reduce((stacks, container) => {
        const stack = find(stacks, (aStack) => aStack.name === container.stack);
        if (!stack) {
          stacks.push({
            name: container.stack,
            started: container.State === 'running',
            containers: [container]
          });
        } else {
          stack.containers.push(container);
          stack.started = !!stack.containers.find(aContainer => aContainer.State === 'running');
        }
        return stacks;
      }, <DockerStack[]>[]);
    }
  }

  async initContainersInformations() {
    const containers = await this.dockerWebService.list().toPromise();
    return containers;
  }

  async displayStack() {
    await this.refreshContainerInformation('stack');
    this.display = 'stack';
  }

  async displayList() {
    await this.refreshContainerInformation('list');
    this.display = 'list';
  }

  async pruneDocker() {
    this.bifrostNotificationService.showInfo(`Starting prune...`);
    const pruneResult = await this.dockerWebService.prune().toPromise();
    this.bifrostNotificationService.showSuccess(`Prune done ${pruneResult.ImagesDeleted || 0} image deleted`);
  }
}
