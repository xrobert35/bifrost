import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockerContainer } from '@shared/interface/container.int';
import { Server } from '@shared/interface/server.int';
import { AsiTableSelectionModel, AsiTableData, AsiTable } from '@asi-ngtools/lib';
import { find, forEach } from 'lodash';
import { ServerWebService } from '@rest/server.webservice';

@Component({
  selector: 'server-page',
  templateUrl: './server.page.html'
})
export class ServerPage implements AfterViewInit {


  @ViewChild(AsiTable) asiTable: AsiTable<DockerContainer>;

  containers: Array<DockerContainer>;
  server: Server;
  onlyActive: boolean;

  serverSelectionModel = new AsiTableSelectionModel('Id', true);

  constructor(private activatedRoute: ActivatedRoute, private serverWebService: ServerWebService) {
    this.containers = this.activatedRoute.snapshot.data.containers;
    this.server = this.activatedRoute.snapshot.data.server;

    if (!this.server) {
      this.server = {
        port: 80,
        serverName: 'localhost',
        locations: []
      };
    }
  }

  ngAfterViewInit() {
    forEach(this.containers, (container) => {
      container.name = container.Names[0].substring(1);
      container.tag = container.Image.split(':')[1];
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

  onShowOnlyActiveChanged() {
    this.asiTable.fireRefresh();
  }

  refreshTable = () => {
    const tableData = new AsiTableData<DockerContainer>();
    tableData.results = this.containers;

    if (this.onlyActive) {
      tableData.results = this.serverSelectionModel.itemsIncluded;
    }

    return tableData;
  }

  recreateContainer() {
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
