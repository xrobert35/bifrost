import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockerContainer } from '@shared/interface/container.int';
import { Server } from '@shared/interface/server.int';
import { AsiTableSelectionModel, AsiTableData, AsiTable } from '@asi-ngtools/lib';
import { find, forEach } from 'lodash';
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

  serverSelectionModel = new AsiTableSelectionModel('Id', true);

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

    await this.updateContainers();

    tableData.results = this.containers;

    if (this.server.onlyActive) {
      tableData.results = this.serverSelectionModel.itemsIncluded;
    }

    return tableData;
  }

  async updateContainers() {
    this.containers = await this.serverWebService.containers().toPromise();
    this.serverSelectionModel = new AsiTableSelectionModel('Id', true);
    forEach(this.containers, (container) => {
      container.name = container.Names[0].substring(1);
      if (container.Image) {
        container.imageName = container.Image.split(':')[0];
        container.tag = container.Image.split(':')[1];
      } else {
        container.imageName = 'unknown';
        container.tag = 'unknown';
      }
      const location = find(this.server && this.server.locations, ['name', container.name]);
      if (location) {
        if (location.activated) {
          this.serverSelectionModel.itemsIncluded.push(container);
        }

        container.proxyPass = location.proxyPass;
        container.proxyPath = location.path;
      }
    });
  }


  async startContainer(container: DockerContainer) {
    this.bifrostNotificationService.showInfo(`Starting ${container.name}...`);
    await this.serverWebService.startContainer(container.Id).toPromise();
    this.asiTable.fireRefresh();
    this.bifrostNotificationService.showSuccess(`${container.name} is now running`);
  }

  async stopContainer(container: DockerContainer) {
    this.bifrostNotificationService.showInfo(`Stoping ${container.name}...`);
    await this.serverWebService.stopContainer(container.Id).toPromise();
    this.asiTable.fireRefresh();
    this.bifrostNotificationService.showSuccess(`${container.name} is now stopped`);
  }

  async recreateContainer(container: DockerContainer) {
    this.bifrostNotificationService.showInfo(`Recreating ${container.name}...`);
    await this.serverWebService.recreateContainer(container.Id, {image : container.imageName + ':' + container.tag}).toPromise();
    this.asiTable.fireRefresh();
    this.bifrostNotificationService.showSuccess(`${container.name} is now up-to-date`);
  }

  updateProxyConf() {
    this.server.locations = [];

    // Ajout des nouveaux proxy
    forEach(this.containers, (container) => {
      this.server.locations.push({
        name: container.name,
        path: container.proxyPath,
        proxyPass: container.proxyPass,
        activated: container['checked']
      });
    });

    this.serverWebService.createUpdate(this.server).subscribe((server) => {
      console.log(server);
    });
  }


}
