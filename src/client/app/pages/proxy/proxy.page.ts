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

  @ViewChild(AsiTable) asiTable: AsiTable<DockerContainer>;

  server: Server;
  newProxy: ServerLocation = { name: null, path: null, proxyPass: null };
  proxysSelectionModel = new AsiTableSelectionModel('name', false);
  newProxyForm: FormGroup;

  constructor(private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private serverWebService: ServerWebService,
    private bifrostNotificationService: BifrostNotificationService) {
    this.server = this.activatedRoute.snapshot.data.server || {};

    this.newProxyForm = this.formBuilder.group({
      name: [null, Validators.required],
      proxyPass: [null, Validators.required],
      path: [null, Validators.required]
    });
  }

  refreshTable = async () => {
    const tableData = new AsiTableData<any>();
    tableData.results = this.server.locations;
    return tableData;
  }

  /** Add a new proxy */
  addProxy() {
    if (this.newProxyForm.valid) {
      const newProxy: ServerLocation = this.newProxyForm.value;
      this.serverWebService.addProxy(newProxy).pipe(catchError(res => {
        if (res.error.fonctional) {
          this.bifrostNotificationService.showError(res.error.libelle);
        }
        return throwError(res);
      })).subscribe((proxy) => {
        this.server.locations.push(proxy);
        this.bifrostNotificationService.showInfo(`New proxy has been added`);
        this.asiTable.fireRefresh();
      });
    }
  }

  /** Delete an existing proxy */
  removeProxy(proxyToDelete: ServerLocation) {
    this.serverWebService.removeProxy(proxyToDelete).subscribe(() => {
      remove(this.server.locations, (proxy) => proxy === proxyToDelete);
      this.bifrostNotificationService.showInfo(`Proxy has been removed`);
      this.asiTable.fireRefresh();
    });
  }

}
