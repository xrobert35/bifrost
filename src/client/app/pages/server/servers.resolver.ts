import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { ServerWebService } from '@rest/server.webservice';

@Injectable()
export class ServersResolver implements Resolve<any> {

  constructor(private serverWebService: ServerWebService) {
  }

  async resolve() {
    return await this.serverWebService.list().toPromise();
  }

}
