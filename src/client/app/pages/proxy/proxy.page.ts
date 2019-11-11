import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Server } from '@shared/interface/server.int';
import { AsiTableData, AsiTableSelectionModel, AsiTable } from '@asi-ngtools/lib';
import { ServerLocation } from '@shared/interface/serverLocation.int';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { remove } from 'lodash';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { ServerWebService } from '@rest/server.webservice';
import { DockerContainer } from '@shared/interface/container.int';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'proxy-page',
  host: { 'class': 'proxy-page page' },
  templateUrl: './proxy.page.html'
})
export class ProxyPage {

  @ViewChild(AsiTable, {static: true}) asiTable: AsiTable<DockerContainer>;

  server: Server;
  newProxy: ServerLocation = { name: null, path: null, proxyPass: null };
  proxysSelectionModel = new AsiTableSelectionModel('name', false);
  proxyForm: FormGroup;

  editedProxy: ServerLocation;

  constructor(private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private serverWebService: ServerWebService,
    private bifrostNotificationService: BifrostNotificationService) {
    this.server = this.activatedRoute.snapshot.data.server || {};

    this.proxyForm = this.formBuilder.group({
      name: [null, Validators.required],
      proxyPass: [null, Validators.required],
      path: [null, Validators.required],
      reference: null
    });
  }

  refreshTable = async () => {
    const tableData = new AsiTableData<any>();
    tableData.results = this.server.locations;
    return tableData;
  }

  submitProxy() {
    if (this.proxyForm.valid) {
      if (!this.editedProxy) {
        this.createProxy();
      } else {
        this.editProxy();
      }
    }
  }

  /** Add a new proxy */
  createProxy() {
    const newProxy: ServerLocation = this.proxyForm.value;
    this.serverWebService.create(newProxy).pipe(catchError(res => {
      if (res.error.fonctional) {
        this.bifrostNotificationService.showError(res.error.libelle);
      }
      return throwError(res);
    })).subscribe((proxy) => {
      this.proxyForm.reset();
      this.server.locations.push(proxy);
      this.bifrostNotificationService.showInfo(`New proxy has been added`);
      this.asiTable.fireRefresh();
    });
  }

  /** Edit a proxy */
  editProxy() {
    const proxy: ServerLocation = this.proxyForm.value;
    this.serverWebService.update(proxy).pipe(catchError(res => {
      if (res.error.fonctional) {
        this.bifrostNotificationService.showError(res.error.libelle);
      }
      return throwError(res);
    })).subscribe(() => {
      Object.assign(this.editedProxy, proxy);
      this.proxyForm.reset();
      this.bifrostNotificationService.showInfo(`Proxy "${proxy.name} has been updated`);
      this.asiTable.fireRefresh();
    });
  }

  startEditProxy(proxy: ServerLocation) {
    this.editedProxy = proxy;
    this.proxyForm.setValue({
      name: proxy.name,
      proxyPass: proxy.proxyPass,
      path: proxy.path,
      reference: proxy.reference
    });
  }

  endEditProxy() {
    this.editedProxy = null;
    this.proxyForm.reset();
  }

  /** Delete an existing proxy */
  deleteProxy(proxyToDelete: ServerLocation) {
    this.serverWebService.delete(proxyToDelete).pipe(catchError(res => {
      if (res.error.fonctional) {
        this.bifrostNotificationService.showError(res.error.libelle);
      }
      return throwError(res);
    })).subscribe(() => {
      remove(this.server.locations, (proxy) => proxy === proxyToDelete);
      this.bifrostNotificationService.showInfo(`Proxy has been removed`);
      this.asiTable.fireRefresh();
    });
  }

}
