import { Component, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockerContainer } from '@shared/interface/container.int';
import { Server } from '@shared/interface/server.int';
import { AsiTableSelectionModel, AsiTableData, AsiTable, AsiTableRequest } from '@asi-ngtools/lib';
import { find, forEach, filter, isEmpty } from 'lodash';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { DockerWebService } from '@rest/docker.webservice';
import { ServerWebService } from '@rest/server.webservice';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { DockerStack } from '@shared/interface/stack.int';

@Component({
  selector: 'docker-page',
  host: { 'class': 'docker-page page' },
  templateUrl: './docker.page.html'
})
export class DockerPage {

  @ViewChildren(AsiTable) asiTable: QueryList<AsiTable<DockerStack>>;

  stacks: Array<DockerStack>;
  server: Server;

  serverSelectionModel = new AsiTableSelectionModel('name', false);

  logContainerId: string = null;

  display: 'list' | 'stack' = 'stack';

  constructor(private activatedRoute: ActivatedRoute,
    private bifrostNotificationService: BifrostNotificationService,
    private dockerWebService: DockerWebService,
    private serverWebService: ServerWebService) {
    this.server = this.activatedRoute.snapshot.data.server;

    if (!this.server) {
      this.server = {
        onlyActive: false,
        port: 80,
        serverName: 'localhost',
        locations: []
      };
    }
  }

  ngOnInit() {
    this.refreshContainerInformation(this.display);
  }

  onShowOnlyActiveChanged() {
    this.asiTable.toArray().forEach(asiTable => asiTable.fireRefresh());
  }

  async refreshContainerInformation(display: 'list' | 'stack') {
    const containers = await this.initContainersInformations();

    if (display === 'list') {
      this.stacks = [{
        name: 'all containers',
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

  refreshTable = async (tableRequest: AsiTableRequest) => {
    const tableData = new AsiTableData<DockerContainer>();

    let stack: DockerStack;
    if (tableRequest.identifier) {
      stack = find(this.stacks, (aStack) => aStack.name === tableRequest.identifier);
    } else {
      stack = this.stacks[0];
    }

    let containers = stack.containers;
    if (this.server.onlyActive) {
      containers = filter(containers, (container: DockerContainer) => !isEmpty(container.proxyPath));
    }

    tableData.results = containers;

    return tableData;
  }

  async initContainersInformations() {
    const containers = await this.dockerWebService.list().toPromise();
    this.serverSelectionModel.itemsIncluded = [];
    forEach(containers, (container) => {
      container.name = container.Names[0].substring(1);
      if (container.Image) {
        container.imageName = container.Image.split(':')[0];
        if (container.imageName.includes('/')) {
          const splitName = container.imageName.split('/');
          container.imageRepo = splitName[0];
          container.imageName = splitName[1];
        }
        container.tag = container.Image.split(':')[1];
      } else {
        container.imageName = 'unknown';
        container.tag = 'unknown';
      }

      container.tooltip = container.ImageDigestId || container.ImageID;
      const location = find(this.server && this.server.locations, ['name', container.name]);
      if (location) {
        container.proxyPass = location.proxyPass;
        container.proxyPath = location.path;
      }
    });
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

  async startStack(stack: DockerStack) {
    await this.startContainers(stack.containers);
    await this.refreshContainerInformation(this.display);
    this.asiTable.toArray()
      .find((asiTable) => asiTable.identifier === stack.name)
      .fireRefresh();
  }

  async stopStack(stack: DockerStack) {
    await this.stopContainers(stack.containers);
    await this.refreshContainerInformation(this.display);
    this.asiTable.toArray()
      .find((asiTable) => asiTable.identifier === stack.name)
      .fireRefresh();
  }

  async deleteStack(stack: DockerStack) {
    await this.deleteContainers(stack.containers);
    await this.refreshContainerInformation(this.display);
    this.asiTable.toArray()
      .find((asiTable) => asiTable.identifier === stack.name)
      .fireRefresh();
  }

  async startSelectedContainers() {
    await this.startContainers(this.serverSelectionModel.itemsIncluded);
    await this.refreshContainerInformation(this.display);
    this.asiTable.toArray().forEach(asiTable => asiTable.fireRefresh());
  }

  async stopSelectedContainers() {
    await this.stopContainers(this.serverSelectionModel.itemsIncluded);
    await this.refreshContainerInformation(this.display);
    this.asiTable.toArray().forEach(asiTable => asiTable.fireRefresh());
  }

  async deleteSelectedContainers() {
    await this.deleteContainers(this.serverSelectionModel.itemsIncluded);
    await this.refreshContainerInformation(this.display);
    this.asiTable.toArray().forEach(asiTable => asiTable.fireRefresh());
  }

  async updateSelectedContainers() {
    this.serverSelectionModel.itemsIncluded.forEach(async (container) => {
      this.bifrostNotificationService.showInfo(`Recreating ${container.name}...`);

      let fullImageName = null;
      if (container.imageRepo) {
        fullImageName = container.imageRepo + '/' + container.imageName;
      } else {
        fullImageName = container.imageName;
      }

      if (container.tag) {
        fullImageName += ':' + container.tag;
      }
      container.loading = true;
      try {
        const updatedContainer = await this.dockerWebService.updateContainer(container.Id, { image: fullImageName }).toPromise();
        Object.assign(container, updatedContainer);
        this.bifrostNotificationService.showSuccess(`${container.name} is now up-to-date`);
      } catch (err) {
        this.bifrostNotificationService.showError(`Error while trying to update ${container.name}`);
      } finally {
        container.loading = false;
      }
    });
  }

  private startContainers(containers: DockerContainer[]) {
    const startingContainers = containers.map(async (container) => {
      this.bifrostNotificationService.showInfo(`Starting ${container.name}...`);
      try {
        await this.dockerWebService.startContainer(container.Id).toPromise();
        this.bifrostNotificationService.showSuccess(`${container.name} is now running`);
      } catch (exception) {
        if (exception.error.code) {
          this.bifrostNotificationService.showError(`Can't start ${container.name} : ${exception.error.libelle}`);
        } else {
          this.bifrostNotificationService.showError(`Can't start ${container.name} : unknow error`);
        }
      }
    });
    return Promise.all(startingContainers);
  }

  private stopContainers(containers: DockerContainer[]) {
    const stopppingContainers = containers.map(async (container) => {
      this.bifrostNotificationService.showInfo(`Stoping ${container.name}...`);
      try {
        await this.dockerWebService.stopContainer(container.Id).toPromise();
        this.bifrostNotificationService.showSuccess(`${container.name} is now stopped`);
      } catch (exception) {
        if (exception.error.code) {
          this.bifrostNotificationService.showError(`Can't stop ${container.name} : ${exception.error.libelle}`);
        } else {
          this.bifrostNotificationService.showError(`Can't stop ${container.name} : unknow error`);
        }
      }
    });
    return Promise.all(stopppingContainers);
  }

  private deleteContainers(containers: DockerContainer[]) {
    const deletingContainers = containers.map(async (container) => {
      this.bifrostNotificationService.showInfo(`Deleting ${container.name}...`);
      try {
        await this.dockerWebService.deleteContainer(container.Id).toPromise();
        this.bifrostNotificationService.showSuccess(`${container.name} has been deleted`);
      } catch (exception) {
        if (exception.error.code) {
          this.bifrostNotificationService.showError(`Can't delete ${container.name} : ${exception.error.libelle}`);
        } else {
          this.bifrostNotificationService.showError(`Can't delete ${container.name} : unknow error`);
        }
      }
    });
    return Promise.all(deletingContainers);
  }

  async pruneDocker() {
    this.bifrostNotificationService.showInfo(`Starting prune...`);
    const pruneResult = await this.dockerWebService.prune().toPromise();
    this.bifrostNotificationService.showInfo(`Prune done ${pruneResult.ImagesDeleted || 0} image deleted`);
  }

  showLogs(container: DockerContainer) {
    this.logContainerId = container.Id;
  }

  addNewProxy(container: DockerContainer) {
    this.serverWebService.create({
      name: container.name,
      path: '/default',
      proxyPass: 'localhost'
    }).pipe(catchError(res => {
      if (res.error.fonctional) {
        this.bifrostNotificationService.showError(res.error.libelle);
      }
      return throwError(res);
    })).subscribe(() => {
      this.bifrostNotificationService.showInfo(`New proxy has been added`);
    });
  }
}
