import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockerContainer } from '@shared/interface/container.int';
import { Server } from '@shared/interface/server.int';
import { AsiTableSelectionModel, AsiTableData, AsiTable } from '@asi-ngtools/lib';
import { find, forEach, filter, isEmpty } from 'lodash';
import { ServerWebService } from '@rest/server.webservice';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';

@Component({
  selector: 'server-page',
  templateUrl: './server.page.html'
})
export class ServerPage {

  @ViewChild(AsiTable) asiTable: AsiTable<DockerContainer>;

  containers: Array<DockerContainer>;
  server: Server;

  serverSelectionModel = new AsiTableSelectionModel('name', false);

  constructor(private activatedRoute: ActivatedRoute,
    private bifrostNotificationService: BifrostNotificationService,
    private serverWebService: ServerWebService) {
    this.containers = this.activatedRoute.snapshot.data.containers;
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

  onShowOnlyActiveChanged() {
    this.asiTable.fireRefresh();
  }

  refreshTable = async () => {
    const tableData = new AsiTableData<DockerContainer>();

    await this.initContainersInformations();

    tableData.results = this.containers;

    if (this.server.onlyActive) {
      tableData.results = filter(tableData.results, (container: DockerContainer) => {
        return !isEmpty(container.proxyPath);
      });
    }

    return tableData;
  }

  async initContainersInformations() {
    this.containers = await this.serverWebService.containers().toPromise();
    this.serverSelectionModel.itemsIncluded = [];
    forEach(this.containers, (container) => {
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

      // container.tooltip = this.sanitizer.bypassSecurityTrustHtml(`<div> ImageId : ${container.ImageID} </div>`);
      container.tooltip = container.ImageDigestId || container.ImageID;
      const location = find(this.server && this.server.locations, ['name', container.name]);
      if (location) {
        container.proxyPass = location.proxyPass;
        container.proxyPath = location.path;
      }
    });
  }


  async startContainers() {
    this.serverSelectionModel.itemsIncluded.forEach(async (container) => {
      this.bifrostNotificationService.showInfo(`Starting ${container.name}...`);
      await this.serverWebService.startContainer(container.Id).toPromise();
      this.asiTable.fireRefresh();
      this.bifrostNotificationService.showSuccess(`${container.name} is now running`);
    });
  }

  async stopContainers() {
    this.serverSelectionModel.itemsIncluded.forEach(async (container) => {
      this.bifrostNotificationService.showInfo(`Stoping ${container.name}...`);
      await this.serverWebService.stopContainer(container.Id).toPromise();
      this.asiTable.fireRefresh();
      this.bifrostNotificationService.showSuccess(`${container.name} is now stopped`);
    });
  }

  async deleteContainers() {
    this.serverSelectionModel.itemsIncluded.forEach(async (container) => {
      this.bifrostNotificationService.showInfo(`Deleting ${container.name}...`);
      await this.serverWebService.deletetContainer(container.Id).toPromise();
      this.asiTable.fireRefresh();
      this.bifrostNotificationService.showSuccess(`${container.name} has been deleted`);
    });
  }

  async updateContainers() {
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
        const updatedContainer = await this.serverWebService.updateContainer(container.Id, { image: fullImageName }).toPromise();
        Object.assign(container, updatedContainer);
        this.bifrostNotificationService.showSuccess(`${container.name} is now up-to-date`);
      } catch (err) {
        this.bifrostNotificationService.showError(`Error while trying to update ${container.name}`);
      } finally {
        container.loading = false;
      }

    });
  }

  async pruneDocker() {
    this.bifrostNotificationService.showInfo(`Starting prune...`);
    const pruneResult = await this.serverWebService.prune().toPromise();
    this.bifrostNotificationService.showInfo(`Prune done ${pruneResult.ImagesDeleted || 0} image deleted`);
  }

  updateProxyConf() {
    this.bifrostNotificationService.showInfo(`Start updating proxy...`);
    this.server.locations = [];

    // Ajout des nouveaux proxy
    forEach(this.containers, (container) => {
      this.server.locations.push({
        name: container.name,
        path: container.proxyPath,
        proxyPass: container.proxyPass
      });
    });

    this.serverWebService.createUpdate(this.server).subscribe(() => {
      this.bifrostNotificationService.showSuccess(`Proxy updated`);
    });
  }


}
