import { Component, Input, ViewChild } from '@angular/core';
import { DockerStack } from '@shared/interface/stack.int';
import { AsiTable, AsiTableSelectionModel, AsiTableRequest, AsiTableData } from '@asi-ngtools/lib';
import { DockerContainer } from '@shared/interface/container.int';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { DockerWebService } from '@rest/docker.webservice';
import { ServerWebService } from '@rest/server.webservice';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { UniversalService } from 'client/app/common/universal/universal.service';


@Component({
  selector: 'stack-display',
  host: { 'class': 'stack-display flex-column' },
  templateUrl: './stack-display.component.html'
})
export class StackDisplayComponent {

  @ViewChild(AsiTable, { static: false }) asiTable: AsiTable<DockerStack>;

  @Input()
  stack: DockerStack;

  @Input()
  onlyActive = false;

  @Input()
  paginate = false;

  nbElementByPage = 20;

  host: string;

  containerSelectionModel = new AsiTableSelectionModel('name', false);

  constructor(private bifrostNotificationService: BifrostNotificationService,
    private dockerWebService: DockerWebService,
    private serverWebService: ServerWebService,
    private universalService: UniversalService,
    private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    if (this.stack) {
      this.nbElementByPage = 100;
    } else {
      this.nbElementByPage = 20;
    }
  }

  refreshTable = async (_tableRequest: AsiTableRequest) => {
    this.containerSelectionModel.itemsIncluded = [];
    this.containerSelectionModel.allChecked = false;
    this.containerSelectionModel.itemsExcluded = [];

    const tableData = new AsiTableData<DockerContainer>();

    tableData.results = this.stack.containers;
    tableData.paginate = this.paginate;

    return tableData;
  }

  private async refreshStackContainer() {
    const containers = await this.dockerWebService.list(this.stack.name).toPromise();
    this.stack.containers = containers;
    this.stack.started = !!this.stack.containers.find(aContainer => aContainer.State === 'running');
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

  async restartSelectedContainers() {
    await this.stopContainers(this.getSelectedContainers());
    await this.startContainers(this.getSelectedContainers());
    await this.refreshStackContainer();
    this.asiTable.fireRefresh();
  }

  async startSelectedContainers() {
    await this.startContainers(this.getSelectedContainers());
    await this.refreshStackContainer();
    this.asiTable.fireRefresh();
  }

  async stopSelectedContainers() {
    await this.stopContainers(this.getSelectedContainers());
    await this.refreshStackContainer();
    this.asiTable.fireRefresh();
  }

  async deleteSelectedContainers() {
    await this.deleteContainers(this.getSelectedContainers());
    await this.refreshStackContainer();
    this.asiTable.fireRefresh();
  }

  async updateSelectedContainers() {
    this.containerSelectionModel.itemsIncluded.forEach(async (container) => {
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

  addNewProxy(container: DockerContainer) {
    this.serverWebService.create({
      name: container.name,
      path: '/default',
      proxyPass: 'http://localhost'
    }).pipe(catchError(res => {
      if (res.error.fonctional) {
        this.bifrostNotificationService.showError(res.error.libelle);
      }
      return throwError(res);
    })).subscribe(() => {
      this.bifrostNotificationService.showSuccess(`New proxy has been added`);
    });
  }

  getAppLocation(port: string) {
    if (this.universalService.isClient()) {
      if (port) {
        return this.sanitizer.bypassSecurityTrustUrl(window.location.hostname + ':' + port);
      }
    }
    return undefined;
  }

  private getSelectedContainers(): DockerContainer[] {
    if (this.containerSelectionModel.allChecked) {
      return this.stack.containers;
    } else {
      return this.containerSelectionModel.itemsIncluded;
    }
  }
}
