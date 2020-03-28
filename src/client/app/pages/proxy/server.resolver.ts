import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { ServerWebService } from '@rest/server.webservice';

@Injectable()
export class ServerResolver implements Resolve<any> {

  constructor(private serverWebService: ServerWebService) {
  }

  async resolve() {
    const server = await this.serverWebService.get().toPromise();
    return server;
  }

}
